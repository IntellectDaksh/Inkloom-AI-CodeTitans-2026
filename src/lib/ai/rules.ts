/**
 * Inkloom AI Brand Governance Engine - Deterministic Rule Checks (Stage 2)
 * 
 * Performs fast, deterministic compliance checks:
 * 1. Prohibited terms and phrases from brand lists
 * 2. Required phrases and channel-specific disclaimers
 * 3. Usage of expired or deprecated claims
 * 4. Out-of-scope claim context and unauthorized channel distribution
 */

import {
  ContentChannel,
  ClaimRecord,
  ProhibitedTermRule,
  RequiredPhraseRule,
  RuleViolation,
  RuleCheckResult,
} from './types';

// ============================================================================
// Utility Helpers
// ============================================================================

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'our', 'your', 'we', 'you', 'this', 'these', 'their', 'than'
]);

function extractSignificantKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Compiled once per (pattern, flags) so repeat scans don't rebuild regexes.
const REGEX_CACHE = new Map<string, RegExp>();
function compiled(source: string, flags: string): RegExp {
  const key = `${flags}/${source}`;
  let re = REGEX_CACHE.get(key);
  if (!re) { re = new RegExp(source, flags); REGEX_CACHE.set(key, re); }
  re.lastIndex = 0;
  return re;
}

const UNIVERSAL_NEGATION = /\b(no|nothing|nobody|none)\s+(?:\w+\s+){0,2}(is|are|can\s+be)\s+$/i;
const COPULA_NOT = /\b(is|are|was|were)\s+(not|never)\s+$|\b(isn't|aren't|wasn't|weren't)\s+$/i;

/**
 * True when a matched term should not count as the brand making the claim:
 * - negated statements ("no system is bulletproof", "it is not unhackable")
 * - mid-sentence Title Case word followed by another capitalised word (proper noun: "the Miracle Mile").
 * "is no magic bullet" still counts: that phrasing invokes the term about the product.
 * ponytail: lexical heuristic, not a parser. Gemini covers the long tail when a key is set.
 */
export function isSuppressedMatch(content: string, start: number, end: number): boolean {
  const clause = content.slice(Math.max(0, start - 40), start).split(/[.!?;:\n]/).pop() ?? '';
  if (UNIVERSAL_NEGATION.test(clause) || COPULA_NOT.test(clause)) return true;
  const atSentenceStart = /(^|[.!?\n]\s*)$/.test(content.slice(Math.max(0, start - 3), start)) || start === 0;
  return !atSentenceStart && /^[A-Z]/.test(content.slice(start, end)) && /^\s+[A-Z][a-z]/.test(content.slice(end, end + 20));
}

function findMatches(
  content: string,
  term: string,
  matchMode: 'exact' | 'regex' | 'word_boundary' = 'word_boundary',
  caseSensitive = false
): Array<{ matchedText: string; startIndex: number; endIndex: number }> {
  const matches: Array<{ matchedText: string; startIndex: number; endIndex: number }> = [];

  if (!term || !content) return matches;

  try {
    let pattern: RegExp;
    const flags = caseSensitive ? 'g' : 'gi';

    if (matchMode === 'exact') {
      let pos = 0;
      const searchContent = caseSensitive ? content : content.toLowerCase();
      const searchTerm = caseSensitive ? term : term.toLowerCase();

      while ((pos = searchContent.indexOf(searchTerm, pos)) !== -1) {
        matches.push({
          matchedText: content.slice(pos, pos + term.length),
          startIndex: pos,
          endIndex: pos + term.length,
        });
        pos += searchTerm.length;
      }
      return matches;
    } else if (matchMode === 'regex') {
      pattern = compiled(term, flags);
    } else {
      // word_boundary
      pattern = compiled(`\\b${escapeRegex(term)}\\b`, flags);
    }

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      matches.push({
        matchedText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
      if (!pattern.global) break;
    }
  } catch {
    // If regex is invalid, fallback to literal substring search
    const lowerContent = content.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let pos = 0;
    while ((pos = lowerContent.indexOf(lowerTerm, pos)) !== -1) {
      matches.push({
        matchedText: content.slice(pos, pos + term.length),
        startIndex: pos,
        endIndex: pos + term.length,
      });
      pos += lowerTerm.length;
    }
  }

  return matches;
}

// ============================================================================
// Rule Checkers
// ============================================================================

/**
 * 1. Check for prohibited terms and phrases from brand terms list
 */
export function checkProhibitedTerms(
  content: string,
  rules: ProhibitedTermRule[]
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  for (const rule of rules) {
    const matches = findMatches(
      content,
      rule.term,
      rule.matchMode ?? 'word_boundary',
      rule.caseSensitive ?? false
    );

    for (const match of matches) {
      if (isSuppressedMatch(content, match.startIndex, match.endIndex)) continue;
      violations.push({
        id: `pt_${rule.id}_${match.startIndex}`,
        ruleId: rule.id,
        ruleType: 'prohibited_term',
        category: rule.category ?? 'prohibited_term',
        severity: rule.severity,
        matchedText: match.matchedText,
        startIndex: match.startIndex,
        endIndex: match.endIndex,
        message: rule.reason || `Prohibited term detected: "${rule.term}".`,
        suggestedReplacement: rule.suggestedReplacement,
        metadata: {
          term: rule.term,
          matchMode: rule.matchMode ?? 'word_boundary',
        },
      });
    }
  }

  return violations;
}

/**
 * 2. Check for required phrases or disclaimers for specific content channels
 */
export function checkRequiredPhrases(
  content: string,
  channel: ContentChannel,
  rules: RequiredPhraseRule[]
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const lowerContent = content.toLowerCase();

  for (const rule of rules) {
    // Skip if rule has channel filters and current channel is not one of them
    if (rule.channels && rule.channels.length > 0 && !rule.channels.includes(channel)) {
      continue;
    }

    const phraseToFind = rule.exactMatch ? rule.phrase : rule.phrase.toLowerCase();
    const targetContent = rule.exactMatch ? content : lowerContent;

    let phraseFound = false;

    if (rule.placement === 'footer') {
      // Check last 30% of content or last 300 characters
      const footerCutoff = Math.max(0, Math.floor(content.length * 0.7));
      // Footer = the phrase ENDS inside the last 30% (in a one-line ad the disclosure starts earlier).
      const pos = targetContent.lastIndexOf(phraseToFind);
      phraseFound = pos >= 0 && pos + phraseToFind.length >= footerCutoff;
    } else if (rule.placement === 'header') {
      const headerCutoff = Math.min(content.length, Math.ceil(content.length * 0.3) + 100);
      const headerSegment = targetContent.slice(0, headerCutoff);
      phraseFound = headerSegment.includes(phraseToFind);
    } else {
      phraseFound = targetContent.includes(phraseToFind);
    }

    if (!phraseFound) {
      violations.push({
        id: `rp_${rule.id}_missing`,
        ruleId: rule.id,
        ruleType: 'missing_required_phrase',
        category: 'missing_disclosure',
        severity: rule.severity,
        matchedText: '',
        startIndex: undefined,
        endIndex: undefined,
        message: `Missing mandatory disclosure for channel "${channel}": "${rule.phrase}". ${rule.reason}`,
        suggestedReplacement: `Append disclosure: "${rule.phrase}"`,
        metadata: {
          requiredPhrase: rule.phrase,
          placement: rule.placement ?? 'anywhere',
          targetChannel: channel,
        },
      });
    }
  }

  return violations;
}

/**
 * 3. Check for usage of expired or deprecated claims
 */
export function checkExpiredOrDeprecatedClaims(
  content: string,
  claims: ClaimRecord[]
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const now = new Date().toISOString();

  // Filter for claims that are expired, deprecated, or past validUntil date
  const expiredOrDeprecated = claims.filter(c => {
    if (c.status === 'expired' || c.status === 'deprecated') return true;
    if (c.validUntil && c.validUntil < now) return true;
    return false;
  });

  const sentences = content.split(/(?<=[.!?\n])\s+/);

  for (const claim of expiredOrDeprecated) {
    const isDeprecated = claim.status === 'deprecated';
    const claimKeywords = claim.normalizedKeywords && claim.normalizedKeywords.length > 0
      ? claim.normalizedKeywords
      : extractSignificantKeywords(claim.claimText);

    // Direct substring or exact phrase match
    const lowerContent = content.toLowerCase();
    const lowerClaim = claim.claimText.toLowerCase();

    let directPos = lowerContent.indexOf(lowerClaim);
    if (directPos !== -1) {
      violations.push({
        id: `claim_${claim.id}_${directPos}`,
        ruleId: claim.id,
        ruleType: isDeprecated ? 'deprecated_claim' : 'expired_claim',
        category: 'time_bound_claim',
        severity: isDeprecated ? 'high' : 'critical',
        matchedText: content.slice(directPos, directPos + claim.claimText.length),
        startIndex: directPos,
        endIndex: directPos + claim.claimText.length,
        message: `Usage of ${claim.status} claim "${claim.claimText}". ${
          claim.validUntil ? `Expired on ${claim.validUntil}. ` : ''
        }${claim.deprecationReason || 'This claim is no longer valid or authorized.'}`,
        suggestedReplacement: 'Remove this claim or replace with a currently verified active claim.',
        metadata: {
          claimId: claim.id,
          status: claim.status,
          validUntil: claim.validUntil,
        },
      });
      continue;
    }

    // High keyword overlap match across sentences
    let sentenceOffset = 0;
    for (const sentence of sentences) {
      const sentKeywords = new Set(extractSignificantKeywords(sentence));
      if (claimKeywords.length > 0) {
        const matchesCount = claimKeywords.filter(k => sentKeywords.has(k)).length;
        const overlapRatio = matchesCount / claimKeywords.length;

        // If at least 70% of significant claim keywords match in a single sentence
        if (overlapRatio >= 0.70 && matchesCount >= 2) {
          const sentIndex = content.indexOf(sentence, sentenceOffset);
          violations.push({
            id: `claim_${claim.id}_sentence_${sentIndex >= 0 ? sentIndex : 0}`,
            ruleId: claim.id,
            ruleType: isDeprecated ? 'deprecated_claim' : 'expired_claim',
            category: 'time_bound_claim',
            severity: isDeprecated ? 'high' : 'critical',
            matchedText: sentence.trim(),
            startIndex: sentIndex >= 0 ? sentIndex : undefined,
            endIndex: sentIndex >= 0 ? sentIndex + sentence.length : undefined,
            message: `Sentence matches ${Math.round(overlapRatio * 100)}% of ${claim.status} claim "${claim.claimText}". ${
              claim.validUntil ? `Expired on ${claim.validUntil}. ` : ''
            }${claim.deprecationReason || 'Claim is no longer authorized for use.'}`,
            suggestedReplacement: 'Update copy to remove references to outdated benchmark/guarantee.',
            metadata: {
              claimId: claim.id,
              status: claim.status,
              overlapRatio,
            },
          });
          break;
        }
      }
      sentenceOffset += sentence.length;
    }
  }

  return violations;
}

/**
 * 4. Check for out-of-scope claim context (channel mismatches or context violations)
 */
export function checkOutOfScopeContext(
  content: string,
  channel: ContentChannel,
  claims: ClaimRecord[]
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const lowerContent = content.toLowerCase();

  // Active claims with specific channel or context constraints
  const constrainedClaims = claims.filter(
    c => c.status === 'active' && ((c.allowedChannels && c.allowedChannels.length > 0) || (c.allowedContexts && c.allowedContexts.length > 0))
  );

  for (const claim of constrainedClaims) {
    const claimKeywords = claim.normalizedKeywords && claim.normalizedKeywords.length > 0
      ? claim.normalizedKeywords
      : extractSignificantKeywords(claim.claimText);

    // Check if the claim appears in the content
    const directMatch = lowerContent.includes(claim.claimText.toLowerCase());
    let keywordOverlapMatch = false;
    let matchSnippet = '';

    if (!directMatch && claimKeywords.length > 0) {
      const sentences = content.split(/(?<=[.!?\n])\s+/);
      for (const sent of sentences) {
        const sentKeywords = new Set(extractSignificantKeywords(sent));
        const matchedKw = claimKeywords.filter(k => sentKeywords.has(k));
        if (matchedKw.length >= 2 && matchedKw.length / claimKeywords.length >= 0.6) {
          keywordOverlapMatch = true;
          matchSnippet = sent.trim();
          break;
        }
      }
    }

    if (!directMatch && !keywordOverlapMatch) {
      continue;
    }

    // 4a. Check Channel restrictions
    if (claim.allowedChannels && claim.allowedChannels.length > 0) {
      if (!claim.allowedChannels.includes(channel)) {
        violations.push({
          id: `scope_channel_${claim.id}`,
          ruleId: claim.id,
          ruleType: 'out_of_scope_claim',
          category: 'out_of_scope',
          severity: 'high',
          matchedText: directMatch ? claim.claimText : matchSnippet,
          message: `Claim "${claim.claimText}" is restricted to channels [${claim.allowedChannels.join(', ')}], but content is published on "${channel}".`,
          suggestedReplacement: `Do not use this claim on ${channel}. Use channel-approved copy instead.`,
          metadata: {
            claimId: claim.id,
            allowedChannels: claim.allowedChannels,
            actualChannel: channel,
          },
        });
      }
    }

    // 4b. Check Context restrictions (e.g. enterprise-only, US-only, tier-1)
    if (claim.allowedContexts && claim.allowedContexts.length > 0) {
      const allowedContextsLower = claim.allowedContexts.map(c => c.toLowerCase());

      // Broadening flags that contradict limited scope
      const conflictingScopePatterns = [
        /\ball\s+users\b/i,
        /\bevery\s+customer\b/i,
        /\bfree\s+tier\b/i,
        /\bfree\s+plan\b/i,
        /\bglobally\b/i,
        /\bworldwide\b/i,
        /\bno\s+exceptions\b/i,
        /\ball\s+accounts\b/i,
      ];

      // Wording inside the approved claim itself ("...worldwide.") is not a broadening of it.
      const surrounding = directMatch ? content.replace(new RegExp(escapeRegex(claim.claimText), 'gi'), ' ') : content;
      const hasConflict = conflictingScopePatterns.some(pattern => pattern.test(surrounding));

      // Check if context qualifier is present
      const hasQualifier = allowedContextsLower.some(ctx => {
        // e.g. "enterprise", "us_only" -> "us", "enterprise"
        const cleanCtx = ctx.replace(/_/g, ' ');
        return lowerContent.includes(cleanCtx) || lowerContent.includes(ctx);
      });

      // Only broadening language ("all users", "worldwide") contradicts a scoped claim. A missing qualifier
      // alone is not a violation: tags like "benchmarked_hardware" never appear in natural copy, so requiring
      // them flagged every verbatim use of an approved claim. A claim scoped "global" can't be over-broadened.
      if (hasConflict && !allowedContextsLower.includes('global')) {
        violations.push({
          id: `scope_context_${claim.id}`,
          ruleId: claim.id,
          ruleType: 'out_of_scope_claim',
          category: 'out_of_scope',
          severity: 'medium',
          matchedText: directMatch ? claim.claimText : matchSnippet,
          message: `Claim "${claim.claimText}" requires qualifying context [${claim.allowedContexts.join(', ')}]. Surrounding copy fails to qualify this restriction or implies universal applicability.`,
          suggestedReplacement: `Qualify the statement, e.g.: "For ${claim.allowedContexts.join(' / ')} plans only."`,
          metadata: {
            claimId: claim.id,
            requiredContexts: claim.allowedContexts,
            hasConflict,
            hasQualifier,
          },
        });
      }
    }
  }

  return violations;
}

/**
 * 5. Regulatory disclosures that apply regardless of brand, keyed by channel + content signals.
 * - FTC Endorsement Guides (16 CFR 255): a social post that reads as a creator endorsement
 *   (first person + promo code / affiliate link / gifted) needs a clear #ad, #sponsored or "paid partnership".
 * - FDA / DSHEA (21 CFR 101.93): a supplement structure/function claim needs the
 *   "not evaluated by the Food and Drug Administration" disclaimer on any channel.
 */
const ENDORSEMENT_SIGNAL = /\b(use\s+(my\s+)?code\s+\w+|promo\s+code|discount\s+code|link\s+in\s+(my\s+)?bio|gifted|my\s+affiliate\s+link|ad\s+partner)\b/i;
const FIRST_PERSON = /\b(i|i'm|i've|my|me)\b/i;
const FTC_DISCLOSURE = /(#ad\b|#sponsored\b|#paidpartnership\b|paid\s+partnership|sponsored\s+by|#partner\b)/i;
const SUPPLEMENT_CONTEXT = /\b(supplements?|capsules?|gummies|tea|teatox|powder|scoops?|greens|protein|vitamins?|blend|formula)\b/i;
const STRUCTURE_FUNCTION = /\b(supports?|boosts?|promotes?|improves?|enhances?|aids?|cleanses?|detox(es|ifies)?|burns?|melts?)\s+(?:your\s+|the\s+)?(?:\w+\s+){0,2}?(immun\w*|energy|metabolism|digestion|gut|toxins?|fat|weight|recovery|focus|sleep|skin|joints?|heart)\b/i;
const FDA_DISCLAIMER = /not\s+been\s+evaluated\s+by\s+the\s+food\s+and\s+drug\s+administration/i;

export function checkChannelDisclosures(content: string, channel: ContentChannel): RuleViolation[] {
  const out: RuleViolation[] = [];
  const endorsement = channel === 'social_media' && FIRST_PERSON.test(content) ? ENDORSEMENT_SIGNAL.exec(content) : null;
  if (endorsement && !FTC_DISCLOSURE.test(content)) {
    out.push({
      id: `ftc_endorsement_${endorsement.index}`,
      ruleId: 'reg_ftc_endorsement',
      ruleType: 'missing_required_phrase',
      category: 'missing_disclosure',
      severity: 'high',
      matchedText: endorsement[0],
      startIndex: endorsement.index,
      endIndex: endorsement.index + endorsement[0].length,
      message: 'Reads as a paid creator endorsement on social but has no clear "#ad" / "paid partnership" disclosure (FTC Endorsement Guides, 16 CFR 255).',
      suggestedReplacement: 'Add "#ad" or "Paid partnership with <brand>" at the start of the caption.',
      metadata: { requiredPhrase: '#ad', regulation: 'FTC 16 CFR 255', targetChannel: channel },
    });
  }
  const sf = SUPPLEMENT_CONTEXT.test(content) ? STRUCTURE_FUNCTION.exec(content) : null;
  if (sf && !FDA_DISCLAIMER.test(content)) {
    out.push({
      id: `fda_dshea_${sf.index}`,
      ruleId: 'reg_fda_dshea',
      ruleType: 'missing_required_phrase',
      category: 'missing_disclosure',
      severity: 'high',
      matchedText: sf[0],
      startIndex: sf.index,
      endIndex: sf.index + sf[0].length,
      message: 'Supplement structure/function claim without the DSHEA disclaimer (21 CFR 101.93).',
      suggestedReplacement: 'Add: "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."',
      metadata: { requiredPhrase: 'These statements have not been evaluated by the Food and Drug Administration.', regulation: 'FDA DSHEA 21 CFR 101.93', targetChannel: channel },
    });
  }
  return out;
}

// ============================================================================
// Main Stage 2 Deterministic Rule Runner
// ============================================================================

export function runDeterministicRuleChecks(
  content: string,
  channel: ContentChannel,
  rulesData: {
    prohibitedTerms: ProhibitedTermRule[];
    requiredPhrases: RequiredPhraseRule[];
    allClaims: ClaimRecord[];
  }
): RuleCheckResult {
  const violations: RuleViolation[] = [];

  // 1. Prohibited terms
  const ptViolations = checkProhibitedTerms(content, rulesData.prohibitedTerms);
  violations.push(...ptViolations);

  // 2. Channel-specific required phrases
  const rpViolations = checkRequiredPhrases(content, channel, rulesData.requiredPhrases);
  violations.push(...rpViolations);

  // 3. Expired or deprecated claims
  const expiredViolations = checkExpiredOrDeprecatedClaims(content, rulesData.allClaims);
  violations.push(...expiredViolations);

  // 4. Out-of-scope context claims
  const outOfScopeViolations = checkOutOfScopeContext(content, channel, rulesData.allClaims);
  violations.push(...outOfScopeViolations);

  // 5. Regulatory (FTC endorsement / FDA DSHEA) disclosures per channel
  violations.push(...checkChannelDisclosures(content, channel));

  const totalRulesEvaluated =
    rulesData.prohibitedTerms.length +
    rulesData.requiredPhrases.length +
    rulesData.allClaims.length;

  return {
    violations,
    passedRulesCount: Math.max(0, totalRulesEvaluated - violations.length),
    evaluatedRulesCount: totalRulesEvaluated,
    checkedAt: new Date().toISOString(),
  };
}

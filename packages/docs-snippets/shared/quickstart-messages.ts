/**
 * The quickstart seed transcript — the finite, named seed data the single quickstart
 * tutorial loads before any learner interaction.
 *
 * 24 chronological turns, stable IDs `seed-01`..`seed-24`, alternating 12 user and 12
 * assistant turns. The oldest turn ("Plan a weekend walk.") and the newest ("Ready for
 * your message.") are the tutorial's named end state; the middle is a coherent
 * walk-planning exchange so the learner sees a real thread rather than placeholder
 * rows. No model request ever originates here and no assistant reply is fabricated at
 * runtime — every assistant line is authored seed content.
 */

export type SeedMessage = {
  /** Stable, monotonic key — the Conversation FlatList keyExtractor reads it. */
  id: string;
  /** `user` renders contained and reversed; `assistant` renders full-width. */
  from: 'user' | 'assistant';
  /** The turn body, prefixed `Seed turn NN:` so each leg can assert its reach. */
  text: string;
};

/**
 * Chronological (oldest-first). Conversation reverses its input internally, so the
 * order here is exactly the order a learner reads top-to-bottom after the list renders.
 * Odd indices are user turns, even indices are assistant turns.
 */
export const SEED_MESSAGES: readonly SeedMessage[] = [
  { id: 'seed-01', from: 'user', text: 'Seed turn 01: Plan a weekend walk.' },
  { id: 'seed-02', from: 'assistant', text: 'Seed turn 02: Sounds great. Which neighborhood were you thinking of?' },
  { id: 'seed-03', from: 'user', text: 'Seed turn 03: Maybe the river trail near the old mill.' },
  { id: 'seed-04', from: 'assistant', text: 'Seed turn 04: The mill loop is about four miles and mostly flat, so a relaxed pace works.' },
  { id: 'seed-05', from: 'user', text: 'Seed turn 05: Perfect. Can we add a coffee stop?' },
  { id: 'seed-06', from: 'assistant', text: 'Seed turn 06: Sure. There is a cafe right by the trailhead that opens at eight.' },
  { id: 'seed-07', from: 'user', text: 'Seed turn 07: Let us aim for nine, so it is warm but not crowded.' },
  { id: 'seed-08', from: 'assistant', text: 'Seed turn 08: Nine works. I will check the forecast for Saturday.' },
  { id: 'seed-09', from: 'user', text: 'Seed turn 09: And pack light. Just water and a jacket.' },
  { id: 'seed-10', from: 'assistant', text: 'Seed turn 10: Noted. The forecast shows sun, so a light jacket is plenty.' },
  { id: 'seed-11', from: 'user', text: 'Seed turn 11: Are there any uphill sections to know about?' },
  { id: 'seed-12', from: 'assistant', text: 'Seed turn 12: One gentle climb at mile two. The rest is shaded and flat.' },
  { id: 'seed-13', from: 'user', text: 'Seed turn 13: Good. How long should we plan in total?' },
  { id: 'seed-14', from: 'assistant', text: 'Seed turn 14: About two hours with the coffee stop, so you would be back by noon.' },
  { id: 'seed-15', from: 'user', text: 'Seed turn 15: That leaves the afternoon free.' },
  { id: 'seed-16', from: 'assistant', text: 'Seed turn 16: Exactly. You could add the Saturday market after the walk.' },
  { id: 'seed-17', from: 'user', text: 'Seed turn 17: Nice idea. Is the market near the trailhead?' },
  { id: 'seed-18', from: 'assistant', text: 'Seed turn 18: Two blocks from the cafe, and it is open until two.' },
  { id: 'seed-19', from: 'user', text: 'Seed turn 19: Let us do the walk, then coffee, then the market.' },
  { id: 'seed-20', from: 'assistant', text: 'Seed turn 20: Locked in. I have the route and the stops saved.' },
  { id: 'seed-21', from: 'user', text: 'Seed turn 21: Anything we should bring for the market?' },
  { id: 'seed-22', from: 'assistant', text: 'Seed turn 22: A small tote bag and some cash. A few stalls do not take cards.' },
  { id: 'seed-23', from: 'user', text: 'Seed turn 23: Great. Can you remind me the morning of?' },
  { id: 'seed-24', from: 'assistant', text: 'Seed turn 24: Ready for your message.' },
];

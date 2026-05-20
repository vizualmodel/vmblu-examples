/**
 * @node Animator
 */
class AnimatorNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.registry = [];
    this.bodyPoses = [];
  }

  /**
   * Receives simulation ticks that drive animation updates.
   * @param {SimulationTick} payload
   */
  onAnimTick(payload) {
    if (!this.registry.length || !payload) return;

    // Minimal first pass: forward a heartbeat patch so the renderer path is exercised.
    /** @type {ScenePatchList} */
    const patches = [
      {
        kind: "anim.tick",
        target: "animator",
        payload: {
          simTimeIsoUtc: payload.simTimeIsoUtc,
          count: this.registry.length
        }
      }
    ];
    this.tx.send("anim.scene-patches", patches);
  }

  /**
   * Receives the current set of animatable objects to manage.
   * @param {AnimatableBatch} payload
   */
  onAnimRegistry(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    this.registry = items;
  }

  /**
   * Receives body poses used to update animations tied to celestial bodies.
   * @param {BodyPoseList} payload
   */
  onAnimBodyPoses(payload) {
    this.bodyPoses = Array.isArray(payload) ? payload : [];
  }
}

export function createAnimator(tx, sx) {
  return new AnimatorNode(tx, sx);
}

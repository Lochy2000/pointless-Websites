/**
 * Collision Detection Utilities
 */
const Collision = {
  /**
   * Check rectangle-rectangle collision (AABB)
   * @param {Object} rect1 - {x, y, width, height}
   * @param {Object} rect2 - {x, y, width, height}
   * @returns {boolean}
   */
  rectRect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  },

  /**
   * Check circle-circle collision
   * @param {Object} circle1 - {x, y, radius}
   * @param {Object} circle2 - {x, y, radius}
   * @returns {boolean}
   */
  circleCircle(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  },

  /**
   * Check point-rectangle collision
   * @param {Object} point - {x, y}
   * @param {Object} rect - {x, y, width, height}
   * @returns {boolean}
   */
  pointRect(point, rect) {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
  },

  /**
   * Check point-circle collision
   * @param {Object} point - {x, y}
   * @param {Object} circle - {x, y, radius}
   * @returns {boolean}
   */
  pointCircle(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle.radius;
  },

  /**
   * Check rectangle-circle collision
   * @param {Object} rect - {x, y, width, height}
   * @param {Object} circle - {x, y, radius}
   * @returns {boolean}
   */
  rectCircle(rect, circle) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= circle.radius;
  },

  /**
   * Get all entities colliding with a rectangle
   * @param {Object} rect - {x, y, width, height}
   * @param {Array} entities - Array of entities to check
   * @returns {Array} Array of colliding entities
   */
  getRectCollisions(rect, entities) {
    return entities.filter(entity => {
      if (!entity.x || !entity.y || !entity.width || !entity.height) return false;
      return this.rectRect(rect, entity);
    });
  },

  /**
   * Get all entities colliding with a circle
   * @param {Object} circle - {x, y, radius}
   * @param {Array} entities - Array of entities to check
   * @returns {Array} Array of colliding entities
   */
  getCircleCollisions(circle, entities) {
    return entities.filter(entity => {
      if (entity.radius) {
        return this.circleCircle(circle, entity);
      } else if (entity.width && entity.height) {
        return this.rectCircle(entity, circle);
      }
      return false;
    });
  }
};

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Collision;
}

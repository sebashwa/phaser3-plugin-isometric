import Point3 from './Point3';
const Point = Phaser.Geom.Point;

//  Projection angles
export const CLASSIC = Math.atan(0.5);
export const ISOMETRIC = Math.PI / 6;
export const MILITARY = Math.PI / 4;

/**
 * @class Projector
 *
 * @classdesc
 * Creates a new Isometric Projector object, which has helpers for projecting x, y and z coordinates into axonometric x and y equivalents.
 */
class Projector {
  /**
  * @constructor
  * @param {Phaser.Game} game - The current game object.
  * @param {number} projectionAngle - The angle of the axonometric projection in radians. Defaults to approx. 0.4636476 (Math.atan(0.5) which is suitable for 2:1 pixel art dimetric)
  * @return {Cube} This Cube object.
  */
  constructor(scene, projectionAngle) {
    /**
     * @property {Phaser.Scene} scne - The current scene object.
     */
    this.scene = scene;

    /**
     * @property {array} _transform - The pre-calculated axonometric transformation values.
     * @private
     */
    this._transform = null;

    /**
     * @property {number} _projectionAngle - The cached angle of projection in radians.
     * @private
     */
    this._projectionAngle = 0;

    /**
     * @property {number} projectionAngle - The angle of projection in radians.
     * @default
     */
    this.projectionAngle = projectionAngle || CLASSIC;

    /**
     * @property {Phaser.Geom.Point} origin - The x and y offset multipliers as a ratio of the game world size.
     * @default
     */
    this.origin = new Point(0.5, 0.5);
  }

  /**
   * @name Projector#projectionAngle
   * @property {number} projectionAngle - The angle of axonometric projection.
   */
  set projectionAngle(angle) {
    if (angle === this._projectionAngle) { return; }

    this._projectionAngle = angle;
    this._transform = [Math.cos(this._projectionAngle), Math.sin(this._projectionAngle)];
  }

  get projectionAngle() {
    return this._projectionAngle;
  }

  /**
   * Use axonometric projection to transform a 3D Point3 coordinate to a 2D Point coordinate. If given the coordinates will be set into the object, otherwise a brand new Point object will be created and returned.
   * @method Projector#project
   * @param {Point3} point3 - The Point3 to project from.
   * @param {Phaser.Geom.Point} out - The Point to project to.
   * @return {Phaser.Geom.Point} The transformed Point.
   */
  project(point3, out = new Point()) {
    out.x = (point3.x - point3.y) * this._transform[0];
    out.y = ((point3.x + point3.y) * this._transform[1]) - point3.z;

    const { width, height } = this.scene.sys.game.config;
    out.x += width * this.origin.x;
    out.y += height * this.origin.y;

    return out;
  }

  /**
   * Use axonometric projection to transform a 3D Point3 coordinate to a 2D Point coordinate, ignoring the z-axis. If given the coordinates will be set into the object, otherwise a brand new Point object will be created and returned.
   * @method Projector#projectXY
   * @param {Point3} point3 - The Point3 to project from.
   * @param {Phaser.Geom.Point} out - The Point to project to.
   * @return {Phaser.Geom.Point} The transformed Point.
   */
  projectXY(point3, out = new Point()) {
    out.x = (point3.x - point3.y) * this._transform[0];
    out.y = (point3.x + point3.y) * this._transform[1];

     const { width, height } = this.scene.sys.game.config;
    out.x += width * this.origin.x;
    out.y += height * this.origin.y;

    return out;
  }

  /**
   * Use reverse axonometric projection to transform a 2D Point coordinate to a 3D Point3 coordinate. If given the coordinates will be set into the object, otherwise a brand new Point3 object will be created and returned.
   * @method Projector#unproject
   * @param {Phaser.Geom.Point} point - The Point to project from.
   * @param {Point3} out - The Point3 to project to.
   * @param {number} [z] - Specified z-plane to project to.
   * @return {Point3} The transformed Point3.
   */
  unproject(point, out = new Point3(), z = 0) {
    const { width, height } = this.scene.sys.game.config;
    const x = point.x - this.scene.cameras.main.x - (width * this.origin.x) + this.scene.cameras.main.scrollX;
    const y = point.y - this.scene.cameras.main.y - (height * this.origin.y) + z + this.scene.cameras.main.scrollY;

    out.x = x / (2 * this._transform[0]) + y / (2 * this._transform[1]);
    out.y = -(x / (2 * this._transform[0])) + y / (2 * this._transform[1]);
    out.z = z;

    return out;
  }
}

export default Projector;

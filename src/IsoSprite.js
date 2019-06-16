import Phaser from 'phaser';
import Point3 from './Point3';
import Cube from './Cube';

export const ISOSPRITE = 'IsoSprite';
const Sprite = Phaser.GameObjects.Sprite;

/**
* @class IsoSprite
*
* @classdesc
* Create a new `IsoSprite` object. IsoSprites are extended versions of standard Sprites that are suitable for axonometric positioning.
*
* IsoSprites are simply Sprites that have three new position properties (isoX, isoY and isoZ) and ask the instance of Projector what their position should be in a 2D scene whenever these properties are changed.
* The IsoSprites retain their 2D position property to prevent any problems and allow you to interact with them as you would a normal Sprite. The upside of this simplicity is that things should behave predictably for those already used to Phaser.
*/
export default class IsoSprite extends Sprite {
  /**
   * @constructor
   * @extends Phaser.GameObjects.Sprite
   * @param {Phaser.Scene} scene - A reference to the current scene.
   * @param {number} x - The x coordinate (in 3D space) to position the IsoSprite at.
   * @param {number} y - The y coordinate (in 3D space) to position the IsoSprite at.
   * @param {number} z - The z coordinate (in 3D space) to position the IsoSprite at.
   * @param {string|Phaser.RenderTexture|Phaser.BitmapData} key - This is the image or texture used by the IsoSprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
   * @param {string|number} frame - If this IsoSprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
   */
  constructor(scene, x, y, z, texture, frame) {
    super(scene, x, y, texture, frame);

    /**
     * @property {number} type - The const type of this object.
     * @readonly
     */
    this.type = ISOSPRITE;

    /**
     * @property {Point3} _isoPosition - Internal 3D position.
     * @private
     */
    this._isoPosition = new Point3(x, y, z);

    /**
     * @property {number} snap - Snap this IsoSprite's position to the specified value; handy for keeping pixel art snapped to whole pixels.
     * @default
     */
    this.snap = 0;

    /**
     * @property {boolean} _isoPositionChanged - Internal invalidation control for positioning.
     * @readonly
     * @private
     */
    this._isoPositionChanged = true;

    /**
     * @property {boolean} _isoBoundsChanged - Internal invalidation control for isometric bounds.
     * @readonly
     * @private
     */
    this._isoBoundsChanged = true;

    this._project();

    /**
     * @property {Cube} _isoBounds - Internal derived 3D bounds.
     * @private
     */
    this._isoBounds = this.resetIsoBounds();
  }

  /**
   * The axonometric position of the IsoSprite on the x axis. Increasing the x coordinate will move the object down and to the right on the screen.
   *
   * @name IsoSprite#isoX
   * @property {number} isoX - The axonometric position of the IsoSprite on the x axis.
   */
  get isoX() {
    return this._isoPosition.x;
  }

  set isoX(value) {
    this._isoPosition.x = value;
    this._isoPositionChanged = this._isoBoundsChanged = true;
    if (this.body){
      this.body._reset = true;
    }
  }

  /**
   * The axonometric position of the IsoSprite on the y axis. Increasing the y coordinate will move the object down and to the left on the screen.
   *
   * @name IsoSprite#isoY
   * @property {number} isoY - The axonometric position of the IsoSprite on the y axis.
   */
  get isoY() {
    return this._isoPosition.y;
  }

  set isoY(value) {
    this._isoPosition.y = value;
    this._isoPositionChanged = this._isoBoundsChanged = true;

    if (this.body){
      this.body._reset = true;
    }
  }

  /**
   * The axonometric position of the IsoSprite on the z axis. Increasing the z coordinate will move the object directly upwards on the screen.
   *
   * @name Phaser.Plugin.Isometric.IsoSprite#isoZ
   * @property {number} isoZ - The axonometric position of the IsoSprite on the z axis.
   */
  get isoZ() {
    return this._isoPosition.z;
  }

  set isoZ(value) {
    this._isoPosition.z = value;
    this._isoPositionChanged = this._isoBoundsChanged = true;
    if (this.body){
      this.body._reset = true;
    }
  }

  /**
   * A Point3 object representing the axonometric position of the IsoSprite.
   *
   * @name Phaser.Plugin.Isometric.IsoSprite#isoPosition
   * @property {Point3} isoPosition - The axonometric position of the IsoSprite.
   * @readonly
   */
  get isoPosition() {
    return this._isoPosition;
  }

  /**
   * A Cube object representing the derived boundsof the IsoSprite.
   *
   * @name Phaser.Plugin.Isometric.IsoSprite#isoBounds
   * @property {Point3} isoBounds - The derived 3D bounds of the IsoSprite.
   * @readonly
   */
  get isoBounds() {
    if (this._isoBoundsChanged || !this._isoBounds) {
      this.resetIsoBounds();
      this._isoBoundsChanged = false;
    }

    return this._isoBounds;
  }

  /**
   * Internal function that performs the axonometric projection from 3D to 2D space.
   * @method Phaser.Plugin.Isometric.IsoSprite#_project
   * @memberof Phaser.Plugin.Isometric.IsoSprite
   * @private
   */
  _project() {
    if (this._isoPositionChanged) {
      const pluginKey = this.scene.sys.settings.map.isoPlugin;
      const sceneProjector = this.scene[pluginKey].projector;
      const { x, y } = sceneProjector.project(this._isoPosition);

      this.x = x;
      this.y = y;
      this.depth = (this._isoPosition.x + this._isoPosition.y) + (this._isoPosition.z * 1.25);

      if (this.snap > 0) {
        this.x = Phaser.Math.snapTo(this.x, this.snap);
        this.y = Phaser.Math.snapTo(this.y, this.snap);
      }

      this._isoPositionChanged = this._isoBoundsChanged = true;
    }
  }

  /**
   * Internal function called by the World update cycle.
   *
   * @method IsoSprite#preUpdate
   * @memberof IsoSprite
   */
  preUpdate(time, delta) {
    Sprite.prototype.preUpdate.call(this, time, delta);

    this._project();
  }

  resetIsoBounds() {
    if (typeof this._isoBounds === 'undefined') {
      this._isoBounds = new Cube();
    }

    var asx = Math.abs(this.scaleX);
    var asy = Math.abs(this.scaleY);

    this._isoBounds.widthX = Math.round(Math.abs(this.width) * 0.5) * asx;
    this._isoBounds.widthY = Math.round(Math.abs(this.width) * 0.5) * asx;
    this._isoBounds.height = Math.round(Math.abs(this.height) - (Math.abs(this.width) * 0.5)) * asy;

    this._isoBounds.x = this.isoX + (this._isoBounds.widthX * -this.originX) + this._isoBounds.widthX * 0.5;
    this._isoBounds.y = this.isoY + (this._isoBounds.widthY * this.originX) - this._isoBounds.widthY * 0.5;
    this._isoBounds.z = this.isoZ - (Math.abs(this.height) * (1 - this.originY)) + (Math.abs(this.width * 0.5));

    return this._isoBounds;
  }
}




// Phaser.Utils.Debug.prototype.isoSprite = function (sprite, color, filled) {
//
//   if (!sprite.isoBounds) {
//     return;
//   }
//
//   if (typeof filled === 'undefined') {
//     filled = true;
//   }
//
//   color = color || 'rgba(0,255,0,0.4)';
//
//
//   var points = [],
//     corners = sprite.isoBounds.getCorners();
//
//   var posX = -sprite.game.camera.x;
//   var posY = -sprite.game.camera.y;
//
//   this.start();
//
//   if (filled) {
//     points = [corners[1], corners[3], corners[2], corners[6], corners[4], corners[5], corners[1]];
//
//     points = points.map(function (p) {
//       var newPos = sprite.game.iso.project(p);
//       newPos.x += posX;
//       newPos.y += posY;
//       return newPos;
//     });
//     this.context.beginPath();
//     this.context.fillStyle = color;
//     this.context.moveTo(points[0].x, points[0].y);
//
//     for (var i = 1; i < points.length; i++) {
//       this.context.lineTo(points[i].x, points[i].y);
//     }
//     this.context.fill();
//   } else {
//     points = corners.slice(0, corners.length);
//     points = points.map(function (p) {
//       var newPos = sprite.game.iso.project(p);
//       newPos.x += posX;
//       newPos.y += posY;
//       return newPos;
//     });
//
//     this.context.moveTo(points[0].x, points[0].y);
//     this.context.beginPath();
//     this.context.strokeStyle = color;
//
//     this.context.lineTo(points[1].x, points[1].y);
//     this.context.lineTo(points[3].x, points[3].y);
//     this.context.lineTo(points[2].x, points[2].y);
//     this.context.lineTo(points[6].x, points[6].y);
//     this.context.lineTo(points[4].x, points[4].y);
//     this.context.lineTo(points[5].x, points[5].y);
//     this.context.lineTo(points[1].x, points[1].y);
//     this.context.lineTo(points[0].x, points[0].y);
//     this.context.lineTo(points[4].x, points[4].y);
//     this.context.moveTo(points[0].x, points[0].y);
//     this.context.lineTo(points[2].x, points[2].y);
//     this.context.moveTo(points[3].x, points[3].y);
//     this.context.lineTo(points[7].x, points[7].y);
//     this.context.lineTo(points[6].x, points[6].y);
//     this.context.moveTo(points[7].x, points[7].y);
//     this.context.lineTo(points[5].x, points[5].y);
//     this.context.stroke();
//     this.context.closePath();
//   }
//
//   this.stop();
//
// };

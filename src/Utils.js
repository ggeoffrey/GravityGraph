/**
 * Created by Geoffrey on 5/10/2015.
 */
var EQuality;
(function (EQuality) {
    EQuality[EQuality["LOW"] = 0] = "LOW";
    EQuality[EQuality["MEDIUM"] = 1] = "MEDIUM";
    EQuality[EQuality["HIGH"] = 2] = "HIGH";
})(EQuality || (EQuality = {}));
var GravityGraphTools;
(function (GravityGraphTools) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.prototype.isNumeric = function (item) {
            return !isNaN(parseFloat(item));
        };
        Utils.prototype.parseBoolean = function (item) {
            var ret = !!item;
            if (item == "true") {
                ret = true;
            }
            else if (item == "false") {
                ret = false;
            }
            return ret;
        };
        return Utils;
    })();
    GravityGraphTools.Utils = Utils;
    var Options = (function () {
        function Options(config) {
            this.U = new Utils();
            this._config = config;
        }
        Object.defineProperty(Options.prototype, "target", {
            get: function () {
                return this._config.target;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Options.prototype, "quality", {
            get: function () {
                var quality = EQuality.HIGH;
                switch (this._config.quality) {
                    case "high":
                        quality = EQuality.HIGH;
                        break;
                    case "medium":
                        quality = EQuality.MEDIUM;
                        break;
                    case "low":
                        quality = EQuality.LOW;
                        break;
                }
                return quality;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Options.prototype, "opacity", {
            get: function () {
                return parseFloat(this._config.opacity) || 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Options.prototype, "backgroundColor", {
            get: function () {
                return this._config.backgroundColor || 0x202020;
            },
            enumerable: true,
            configurable: true
        });
        Options.prototype.isTransparent = function () {
            return (this.U.isNumeric(this._config.opacity) && this._config.opacity >= 0 && this._config.opacity < 1);
        };
        Options.prototype.isFlat = function () {
            return this.U.parseBoolean(this._config.flat);
        };
        return Options;
    })();
    GravityGraphTools.Options = Options;
})(GravityGraphTools || (GravityGraphTools = {}));
//# sourceMappingURL=Utils.js.map
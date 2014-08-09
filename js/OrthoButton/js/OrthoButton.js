define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/a11yclick",
    "dijit/_TemplatedMixin",
    "dojo/on",
    "dojo/Deferred",
    // load template    
    "dojo/text!orthobutton/dijit/templates/OrthoButton.html",
    "dojo/i18n!orthobutton/nls/jsapi",
    "dojo/dom-class",
    "dojo/dom-style"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, a11yclick, _TemplatedMixin,
    on,
    Deferred,
    dijitTemplate, i18n,
    domClass, domStyle
) {
    var Widget = declare([_WidgetBase, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.OrthoButton",
        templateString: dijitTemplate,
        options: {
            theme: "OrthoButton",
            mapService: null,
            visible: true,
			serviceVisible: true
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("mapService", defaults.mapService);
            this.set("theme", defaults.theme);
            this.set("visible", defaults.visible);
			this.set("serviceVisible", defaults.serviceVisible);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "orthoContainer",
                ortho: "ortho",
                loading: "loading"
            };
        },
        // bind listener for button to action
        postCreate: function() {
            this.inherited(arguments);
            this.own(
                on(this._orthoNode, a11yclick, lang.hitch(this, this.ortho))
            );
        },
        // start widget. called by user
        startup: function() {
            // mapService not defined
            if (!this.mapService) {
                this.destroy();
                console.log('OrthoButton::mapService required');
            }
            // when map is loaded
            if (this.mapService.loaded) {
                this._init();
            } else {
                on.once(this.mapService, "load", lang.hitch(this, function() {
                    this._init();
                }));
            }
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // ortho
        // load
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        ortho: function() {
            var def = new Deferred();
            var defaultVisible = this.get("serviceVisible");
			defaultVisible = !defaultVisible;
			this.set("serviceVisible", defaultVisible);
			
            this._showLoading();
            var orthoEvt = {
                serviceVisible: defaultVisible
            };
            if(this.mapService){
                this.mapService.setVisibility(defaultVisible);
				this._hideLoading();
				this.emit("ortho", orthoEvt);
				def.resolve(orthoEvt);
            }
            else{
                this._hideLoading();
                var error = new Error("OrthoButton::no ortho service");
                orthoEvt.error = error;
                this.emit("ortho", orthoEvt);
                def.reject(error);
            }
            return def.promise;
        },
        show: function(){
            this.set("visible", true);  
        },
        hide: function(){
            this.set("visible", false);
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function() {
            this._visible();
            
            this.set("loaded", true);
            this.emit("load", {});
        },
        _showLoading: function(){
            domClass.add(this._orthoNode, this._css.loading);
        },
        _hideLoading: function(){
            domClass.remove(this._orthoNode, this._css.loading);
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            domClass.remove(this.domNode, oldVal);
            domClass.add(this.domNode, newVal);
        },
        _visible: function(){
            if(this.get("visible")){
                domStyle.set(this.domNode, 'display', 'block');
            }
            else{
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.OrthoButton", Widget, esriNS);
    }
    return Widget;
});
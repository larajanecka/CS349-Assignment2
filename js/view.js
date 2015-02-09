'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
var LIST_VIEW = 'LIST_VIEW';
var GRID_VIEW = 'GRID_VIEW';
var RATING_CHANGE = 'RATING_CHANGE';
function createViewModule() {


    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        this.view = GRID_VIEW;
        this.imageModel = imageModel;
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel. Must return HTML
         */
        getElement: function() {
            var el = document.getElementById("image-template").content.cloneNode(true);

            el.querySelector(".image").setAttribute("src", "./" + this.imageModel.getPath());
            el.querySelector(".image").addEventListener("click", _.bind(this.edit, this));
            el.querySelector(".name").innerHTML = this.imageModel.getPath().replace("/images/", "");
            el.querySelector(".caption").innerHTML = this.imageModel.getCaption();
            el.querySelector(".date").innerHTML = this.imageModel.getModificationDate();

            var rateChoser = new RateChoser(this.imageModel.getRating())
            el.querySelector(".rating").appendChild(rateChoser.getElement());
            return el;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            this.imageModel = imageModel;
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.view = viewType;

        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.view;
        },

        edit: function() {

            var model = this.imageModel;
            var body = document.querySelector("body");
            var rate = 0;
            var el = document.getElementById("edit-template").content.cloneNode(true);
            var background = el.getElementById("background-div");
            var edit = el.getElementById("edit-container");

            var img = el.querySelector("img");
                img.setAttribute("src", "./" + model.getPath());

            var cap = el.querySelector("input");
                cap.setAttribute("value", model.getCaption());


            var rates =  el.querySelector(".rates");
            var rate = new RateChoser();
            rates.appendChild(rate.getElement());
            rate.addListeners();

            var ok = el.querySelector(".ok");
            var cancel = el.querySelector(".cancel");



            background.addEventListener("click", function(event){
                if(event.target != edit) {
                    body.removeChild(background);
                }
            });

            edit.addEventListener("click", function(e) {
                e.stopPropagation();
            });

            ok.addEventListener("click", function() {
                model.setCaption(cap.value);
                model.setRating(rate.getRate());

                body.removeChild(background);
            });

            cancel.addEventListener("click", function(){
                body.removeChild(background);
            });

            body.appendChild(el);
        }


    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            var render = new ImageRenderer(imageModel);
            imageModel.addListener(_.bind(render.setImageModel, render));
            return render;
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.imageFactory = null;
        this.imageCollectionModel = null;
        this.imageRenderers = [];
        this.view = GRID_VIEW;
        this.rating = 0;
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            var self = this;
            var el =  document.createElement("div");
            if(this.view == GRID_VIEW){
                el.setAttribute("class", "grid collection-container");
            } else if(this.view == LIST_VIEW) {
                el.setAttribute("class", "list collection-container");
            } else {
                throw new Error("Invalid view type");
            }
            _.each(this.imageRenderers, function(rend){
                if(self.rating == 0 || rend.getImageModel().getRating() >= self.rating){
                    el.appendChild(rend.getElement());
                }
            });
            return el;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            var self = this;
            this.imageFactory = imageRendererFactory;
            if(this.imageCollectionModel){
                this.imageRenderers = [];
                _.each(this.imageCollectionModel.imageModels, function(model) {
                    self.imageRenderers.push(self.imageFactory.createImageRenderer(model));
                })
            }
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionModel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            if(this.imageCollectionModel) {
                this.imageCollectionModel.removeListener(_.bind(this.update, this));
            }
            imageCollectionModel.addListener(_.bind(this.update, this));
            this.imageCollectionModel = imageCollectionModel;
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(toolbar, eventType, eventDate) {
            this.view = toolbar.getCurrentView();
            _.each(this.imageRenderers, function(renderer){
                renderer.setToView(toolbar.getCurrentView());
            });
            this.render();
        },

        setFilter: function(toolbar, eventType, eventDate) {
            this.rating = toolbar.getCurrentRatingFilter();
            this.render();
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.view;
        },

        render: function() {
            var container = document.getElementById("app-container");
            var imageContainer = container.getElementsByClassName("collection-container")[0];
            if (imageContainer) {
                container.removeChild(imageContainer);
            }

            container.appendChild(this.getElement());
        },

        update: function(eventType, imageModelCollection, imageModel, eventDate) {
            if(eventType == IMAGE_ADDED_TO_COLLECTION_EVENT){
                this.imageRenderers.push(this.imageFactory.createImageRenderer(imageModel));
            }
            if(eventType == IMAGE_REMOVED_FROM_COLLECTION_EVENT){
                this.imageRenderers = _.without(this.imageRenderers, function(renderer) {
                    return renderer.imageModel = imageModel;
                });
            }

            this.render();
        }

    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.listeners = [];
        this.view = GRID_VIEW;
        this.rating = 0;
    };

    _.extend(Toolbar.prototype, {
        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            var toolbar = document.getElementById("toolbar-template").content.cloneNode(true);

            var buttons = toolbar.querySelector(".view-selector");

            var ratings = toolbar.querySelector(".filter-selector");

            var grid  = new ViewChoser(GRID_VIEW, _.bind(this.setToView, this));
            var list  = new ViewChoser(LIST_VIEW, _.bind(this.setToView, this));
            buttons.appendChild(grid.getElement());
            buttons.appendChild(list.getElement());

            var filter = new RateChoser(0, true, _.bind(this.setRatingFilter, this));

            ratings.appendChild(filter.getElement());
            filter.addListeners();

            return toolbar;

        },

        /**
         * Registers the given listener to be notified when the toolbar changedges from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference loadImageCollectionModelto this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            this.listeners = _.filter(this.listeners, function(list) {
                return list != listener_fn;
            });
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            var self = this;
            this.view = viewType;
            _.each(this.listeners, function(listener) {
                listener(self, viewType, new Date());
            })
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.view;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.rating;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            var self = this;
            this.rating = rating;
            _.each(this.listeners, function(listener) {
                listener(self, RATING_CHANGE, new Date());
            })
        }
    });


    var RateChoser = function(rate, clear, callback) {
        this.rate = rate || 0;
        this.clear = clear || false;
        this.callback = callback || null;
        this.el = null;
    }
    _.extend(RateChoser.prototype, {

        getElement: function() {
            var self = this;

            var el = document.createElement("div");
            el.setAttribute("class", "rateChoser");

            if(self.clear){
                var noRate = document.createElement("span");
                        noRate.setAttribute("value", 0);
                        noRate.setAttribute("class", "rate noRate");
                el.appendChild(noRate);
            }

            _.each(_.range(1, 6), function(i){
                var rateEl = document.createElement("span");
                    rateEl.setAttribute("value", i);

                if (self.rate >= i){
                    rateEl.setAttribute("class", "rate rated");
                } else {
                    rateEl.setAttribute("class", "rate");

                }
                el.appendChild(rateEl);
            });

            this.el = el;

            return el;
        },

        addListeners: function() {
            var el = this.el;
            var self = this;


            var rates = el.querySelectorAll(".rate");

            _.each(rates, function(r){
                r.addEventListener("click", function(e){
                    var val = e.target.getAttribute("value");
                    _.each(rates, function(rate){
                        if (rate.getAttribute("value") != 0) {
                            if(rate.getAttribute("value") <= val){
                                rate.setAttribute("class", "rate rated");
                            } else {
                                rate.setAttribute("class", "rate");
                            }
                        }
                    });
                    self.rate = val;
                    if(self.callback) {
                        self.callback(self.rate);
                    }
                });
            });
        },

        getRate: function(){
            return this.rate;
        }

    });

    var ViewChoser = function(type, callback){
        this.type = type || GRID_VIEW;
        this.callback = callback || null;
    };

    _.extend(ViewChoser.prototype, {
        getElement: function() {
            var self = this;

            var img = document.createElement("img");
            img.setAttribute("src", "./images/" + self.type.toLowerCase() + ".svg");
            if(this.type == GRID_VIEW){
                img.setAttribute("class", "active");
            }


            img.addEventListener("click", function(e){
                _.each(img.parentNode.querySelectorAll(".active"), function(elem){
                    elem.className = elem.className.replace("active", "");
                });
                img.className = img.className + "active";
                self.callback(self.type);
            });

            return img;
        }

    });


    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            this.fileChooserDiv.setAttribute("id", "file-chooser");
            this.fileChooserDiv.setAttribute("style", "display: none");
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            var self = this;
            var el = document.createElement("div");
            el.setAttribute("id", "upload-file");
            el.addEventListener("click", function(e) {
                self.fileChooserDiv.querySelector('.files-input').click(e);
            })
            return el;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}

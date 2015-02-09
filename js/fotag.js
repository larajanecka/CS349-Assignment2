'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');

    var view = new viewModule.ImageCollectionView();
    var model = modelModule.loadImageCollectionModel();
    view.setImageCollectionModel(model);
    view.setImageRendererFactory(new viewModule.ImageRendererFactory());

    var toolbar = new viewModule.Toolbar();
    toolbar.addListener(_.bind(view.setToView, view));
    toolbar.addListener(_.bind(view.setFilter, view));

    appContainer.appendChild(toolbar.getElement());

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    appContainer.appendChild(fileChooser.getElement());

    // Demo that we can choose fileChooser and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        var imageCollectionModel = model;
        _.each(
            files,
            function(file) {
                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        '/images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    ));
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    view.render();


    window.addEventListener("beforeunload", function(e) {
        modelModule.storeImageCollectionModel(view.getImageCollectionModel());
    });
});


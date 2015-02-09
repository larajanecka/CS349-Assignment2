'use strict';

var expect = chai.expect;

describe('Provided unit tests', function() {


});

describe('ImageModel  get tests', function() {
    var date = new Date();
    var modelModule = createModelModule();
    var imageModel = new modelModule.ImageModel("/test1", date, "test", 2);

    it("getPath", function() {
        expect(imageModel.getPath()).to.equal("/test1");
    });
    it("getCaption", function() {
        expect(imageModel.getCaption()).to.equal("test");
    });
    it("getRating", function() {
        expect(imageModel.getRating()).to.equal(2);
    });
    it("getDate", function(){
        expect(imageModel.getModificationDate()).to.equal(date);
    });
});

describe('ImageModel  set tests', function() {
    var date = new Date();
    var modelModule = createModelModule();
    var imageModel = new modelModule.ImageModel("/test1", date, "test", 2);

    it("set caption", function() {
        imageModel.setCaption("Test");
        expect(imageModel.getCaption()).to.equal("Test");
        expect(imageModel.getModificationDate()).to.not.equal(date);

    });

    it("set rating", function() {
        imageModel.setRating(4);
        expect(imageModel.getRating()).to.equal(4);
        expect(imageModel.getModificationDate()).to.not.equal(date);

    });

    it("set empty caption", function() {
        imageModel.setCaption();
        expect(imageModel.getCaption()).to.equal("");

    });

    it("set empty rating", function() {
        imageModel.setRating();
        expect(imageModel.getRating()).to.equal(0);


    });

    it("set invalid caption", function() {
        var a = imageModel.setCaption;
        expect(imageModel.setCaption.bind(imageModel, a)).to.throw("Caption must be a string");

    });

    it("set invalid rating", function() {
        expect(imageModel.setRating.bind(imageModel, "test")).to.throw("Invalid rating, rating must be a number in range 0-5");

    });
});

describe("ImageCollectionModel tests", function() {
    var date = new Date()
    var modelModule = createModelModule();
    var imageModel = new modelModule.ImageModel("/test1", date, "test", 2);
    var imageCollectionModel = new modelModule.ImageCollectionModel();

    it("add image model", function() {
        imageCollectionModel.addImageModel(imageModel);
        expect(imageCollectionModel.getImageModels().length).to.equal(1);
        expect(imageModel.listeners.length).to.equal(1);
    });

    it("remove image model", function() {
        imageCollectionModel.removeImageModel(imageModel);
        expect(imageCollectionModel.getImageModels().length).to.equal(0);
    })

});

describe("Model Listener tests", function() {
    var date = new Date()
    var modelModule = createModelModule();
    var imageModel = new modelModule.ImageModel("/test1", date, "test", 2);
    var imageListener = sinon.spy();
    imageModel.addListener(imageListener);

    it("image add listener", function() {
        expect(imageModel.listeners.length).to.equal(1);
    });


    it("set caption notify listeners", function() {
        imageModel.setCaption("Test");
        expect(imageListener.called).to.be.true;
        expect(imageListener.getCall(0).args[0]).to.equal(imageModel);

    });

    it("set rating notify listeners", function() {
        imageModel.setRating(4);
        expect(imageListener.called).to.be.true;
        expect(imageListener.getCall(1).args[0]).to.equal(imageModel);

    });;
});

describe("Collection Listener tests", function() {
    var date = new Date()
    var modelModule = createModelModule();
    var imageModel = new modelModule.ImageModel("/test1", date, "test", 2);
    var imageCollectionModel = new modelModule.ImageCollectionModel();
    var collectionListener = sinon.spy();
    var imageListener = sinon.spy();
    imageModel.addListener(imageListener);
    imageCollectionModel.addListener(collectionListener);

    it("image add listener", function() {
        expect(imageModel.listeners.length).to.equal(1);
    });

    it("collection add listener", function() {
        expect(imageCollectionModel.listeners.length).to.equal(1);
    });


    it("collection notify listeners when image added", function() {
        imageCollectionModel.addImageModel(imageModel);
        expect(collectionListener.called).to.be.true;
        expect(collectionListener.getCall(0).args[0]).to.equal(IMAGE_ADDED_TO_COLLECTION_EVENT);
        expect(collectionListener.getCall(0).args[2]).to.equal(imageModel);

    });

    it("collection notify listeners when image removed", function() {
        imageCollectionModel.removeImageModel(imageModel);
        expect(collectionListener.callCount).to.equal(2);
        expect(collectionListener.getCall(1).args[0]).to.equal(IMAGE_REMOVED_FROM_COLLECTION_EVENT);
        expect(collectionListener.getCall(1).args[2]).to.equal(imageModel);

    });


    it("image notify listeners when caption set", function() {
        imageCollectionModel.addImageModel(imageModel);
        imageModel.setCaption("Test");
        expect(imageListener.callCount).to.equal(1);
        expect(imageListener.getCall(0).args[0]).to.equal(imageModel);
        expect(collectionListener.getCall(3).args[0]).to.equal(IMAGE_META_DATA_CHANGED_EVENT);
    });
});

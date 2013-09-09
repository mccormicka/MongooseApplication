'use strict';

describe('MongooseApplication Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Index = require('../index');
    var schema = new mongoose.Schema();
    schema.plugin(Index.plugin, {tableName: 'randomTableName'});
    var Model = db.model('randommodel', schema);

    beforeEach(function (done) {
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {

        describe('Create dynamic methods', function () {

            it('Create a static method on the model called createRandomTableName', function (done) {
                expect(typeof Model.createRandomTableName === 'function').toBeTruthy();
                done();
            });

            it('Create a method on the model called createRandomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.createRandomTableName === 'function').toBeTruthy();
                        done();
                    } else {
                        done('Error creating model 1');
                    }
                });
            });

            it('Create a static method on the model called findRandomTableName', function (done) {
                expect(typeof Model.findRandomTableName === 'function').toBeTruthy();
                done();
            });

            it('Create a method on the model called findRandomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.findRandomTableName === 'function').toBeTruthy();
                        done();
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Return the extension randomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.randomTableName === 'function').toBeTruthy();
                        result.randomTableName(function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.TYPE).toBe('randomtablename');
                                done(err);
                            } else {
                                done('Error returning extension object');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

        });

        describe('Application methods', function () {

            it('Attach a new application to the model', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication', description: 'TestApplication Description'},
                            function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    expect(result.name).toBe('TestApplication');
                                    model.findRandomTableName({}, function (err, result) {
                                        expect(err).toBeNull();
                                        expect(result).toBeDefined();
                                        if (result) {
                                            expect(result.length).toBe(1);
                                            expect(result[0].name).toBe('TestApplication');
                                            done(err);
                                        } else {
                                            done('Can not find associated application');
                                        }
                                    });
                                } else {
                                    done('Error creating application');
                                }
                            });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Attach multiple applications to the same model', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeTruthy();
                            model.createRandomTableName({name: 'TestApplication2'}, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeTruthy();
                                model.findRandomTableName({}, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result.length).toBe(2);
                                        expect(result[0].name).toBe('TestApplication');
                                        expect(result[1].name).toBe('TestApplication2');
                                        done(err);
                                    } else {
                                        done('Can not find associated application');
                                    }
                                });
                            });
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Be able to find an application by its values', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeTruthy();
                            model.createRandomTableName({name: 'TestApplication2'}, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeTruthy();
                                model.findRandomTableName({name: 'TestApplication2'}, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result.length).toBe(1);
                                        expect(result[0].name).toBe('TestApplication2');
                                        done(err);
                                    } else {
                                        done('Can not find associated application');
                                    }
                                });
                            });
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Only allow unique names for applications', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeTruthy();
                            model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                                expect(err).toBeDefined();
                                expect(result).toBeFalsy();
                                done();
                            });
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Be able to remove Applications', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication', description: 'TestApplication Description'},
                            function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    model.removeRandomTableName({name: 'TestApplication'}, function (err, result) {
                                        expect(err).toBeNull();
                                        expect(result).toBeDefined();
                                        if (result) {
                                            expect(result.name).toBe('TestApplication');
                                            model.findRandomTableName({name: 'TestApplication'}, function (err, result) {
                                                expect(err).toBeNull();
                                                expect(result).toEqual([]);
                                                done(err);
                                            });
                                        } else {
                                            done('Error removing Application');
                                        }
                                    });
                                } else {
                                    done('Error creating application');
                                }
                            });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Be able to get the model from an application', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication'}, function (err, app) {
                            if (app) {
                                app.findModel(Model, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result._id.toString()).toBe(model._id.toString());
                                        done(err);
                                    } else {
                                        done('Error finding associated model');
                                    }
                                });
                            } else {
                                done('Error retrieving application');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Be able to find a model by application', function (done) {
                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeTruthy();
                    if (model) {
                        model.createRandomTableName({name: 'TestApplication'}, function (err, app) {
                            if (app) {
                                Model.findByRandomTableName({name: 'TestApplication'}, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result._id.toString()).toBe(model._id.toString());
                                        done(err);
                                    } else {
                                        done('Error finding associated model');
                                    }
                                });
                            } else {
                                done('Error retrieving application');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Extend the application schema with the schema passed through the options object', function (done) {

                var schema = new mongoose.Schema();
                schema.plugin(Index.plugin,
                    {
                        tableName: 'randomTableName2',
                        schema: {
                            customType: {
                                type: Boolean,
                                'default': true
                            }
                        }
                    }
                );
                var Model = db.model('randomTableName2', schema);

                Model.create({}, function (err, model) {
                    expect(err).toBeNull();
                    expect(model).toBeDefined();
                    if (model) {
                        model.createRandomTableName2({name: 'TestApplication'}, function (err, result) {
                            expect(result.name).toBe('TestApplication');
                            expect(result.customType).toBe(true);
                            done(err);
                        });
                    } else {
                        done('Error creating new model');
                    }
                });
            });
        });
    });


    describe('API Key / Secret', function () {

        it('Create a unique APIKey associated with the Application', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.name).toBe('TestApplication');
                                result.apiKey(function(err, apiKey){
                                    expect(err).toBeNull();
                                    expect(apiKey).toBeDefined();
                                    if(apiKey){
                                        expect(apiKey.modelId).toBe(result._id.toString());
                                        done(err);
                                    }else{
                                        done('Invalid api key');
                                    }
                                });
                            } else {
                                done('Error creating application');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Create a unique APISecret associated with the Application', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.name).toBe('TestApplication');
                                result.apiSecret(function(err, apiSecret){
                                    expect(err).toBeNull();
                                    expect(apiSecret).toBeDefined();
                                    if(apiSecret){
                                        expect(apiSecret.modelId).toBe(result._id.toString());
                                        done(err);
                                    }else{
                                        done('Invalid api Secret');
                                    }
                                });
                            } else {
                                done('Error creating application');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to find an application owner model by its apikey', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBeTruthy();
                        result.apiKey(function (err, apiKey) {
                            Model.findByRandomTableNameApiKey(apiKey.token, function(err, result){
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if(result){
                                    expect(result._id.toString()).toBe(model._id.toString());
                                    done(err);
                                }else{
                                    done('Error finding application by apiKey');
                                }
                            });
                        });
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to find an application owner model by its apiSecret', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'}, function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBeTruthy();
                        result.apiSecret(function (err, apiSecret) {
                            Model.findByRandomTableNameApiSecret(apiSecret.token, function(err, result){
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if(result){
                                    expect(result._id.toString()).toBe(model._id.toString());
                                    done(err);
                                }else{
                                    done('Error finding application by apiSecret');
                                }
                            });
                        });
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Only allow an application to have one unique APIKey associated with it', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.name).toBe('TestApplication');
                                result.apiKey(function(err, apiKey){
                                    result.createApiKey(function(err, key){
                                        expect(err).toBeNull();
                                        expect(key).toBeDefined();
                                        if(apiKey){
                                            result.apiKey(function(err, newApiKey){
                                                expect(newApiKey._id.toString()).not.toBe(apiKey._id.toString());
                                                done(err);
                                            });
                                        }else{
                                            done('Invalid api key');
                                        }
                                    });
                                });

                            } else {
                                done('Error creating application');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Only allow an application to have one unique APISecret associated with it', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestApplication'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.name).toBe('TestApplication');
                                result.apiSecret(function(err, apiSecret){
                                    result.createApiSecret(function(err, key){
                                        expect(err).toBeNull();
                                        expect(key).toBeDefined();
                                        if(apiSecret){
                                            result.apiSecret(function(err, newApiSecret){
                                                expect(newApiSecret._id.toString()).not.toBe(apiSecret._id.toString());
                                                done(err);
                                            });
                                        }else{
                                            done('Invalid api Secret');
                                        }
                                    });
                                });

                            } else {
                                done('Error creating application');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });
    });
});
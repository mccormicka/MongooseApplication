'use strict';

/**
 * Dynamically create an Application array object to be associated with
 * the Decorated Mongoose object.
 *
 * @options
 * @tableName You MUST set a tableName name property so that
 * the extension is unique on the object. If the name is not unique then an Error Will be thrown.
 */
exports = module.exports = function Extension(schema, pluginOptions) {
    var extension;
    var log = require('nodelogger').Logger(__filename);
    var OAuth = require('mongooseoauthpassport');

    if (!pluginOptions.tableName) {
        throw new Error('You must specify a tableName in the options when creating a MongooseApplication');
    }

    if (pluginOptions.oauth && !pluginOptions.passport) {
        throw new Error('You must specify an instance of Passport.js if you want to use the OAuth Application strategy');
    }

    if (pluginOptions.oauth) {
        pluginOptions.apiKey = true;
    }
//    options = _.defaults(options || {}, {});

    var TYPE = pluginOptions.tableName.toLowerCase();
    var upperTableName = pluginOptions.tableName.slice(0, 1).toUpperCase() + pluginOptions.tableName.slice(1);
    var lowerTableName = pluginOptions.tableName.slice(0, 1).toLowerCase() + pluginOptions.tableName.slice(1);

    var CREATE_METHOD = 'create' + upperTableName;
    var FIND_METHOD = 'find' + upperTableName;
    var REMOVE_METHOD = 'remove' + upperTableName;
    var FIND_BY_METHOD = 'findBy' + upperTableName;

    //API Keys
    var API_KEY = upperTableName + 'Consumer';
    var API_KEY_CREATE_METHOD = 'create' + API_KEY;
    var API_KEY_FIND_METHOD = 'find' + API_KEY;
    var API_KEY_FIND_BY_METHOD = 'findBy' + API_KEY;
    var API_KEY_FIND_BY_KEY_METHOD = 'findBy' + API_KEY + 'Key';
    var API_KEY_FIND_BY_SECRET_METHOD = 'findBy' + API_KEY + 'Secret';

    if (typeof schema.methods[CREATE_METHOD] === 'function') {
        throw new Error('The tablename you specified is not unique to this schema', schema);
    }

    /**
     * Initialize the plugin once the model has loaded.
     */
    schema.on('init', function(model){
        log.info( upperTableName, ' Initialized');
        getExtension(model.db);
    });

    /**
     * create an extension to associate with your model instance can be accessed by
     * yourModelInstance.create'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[CREATE_METHOD] = function (options, next) {
        getExtension(this.db).createExtension(this, options, next);
    };

    /**
     * create an extension to associate with your model instance can be accessed by
     * YourModel.create'extensionName'(modelInstance, options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.statics[CREATE_METHOD] = function (model, options, next) {
        getExtension(this.db).createExtension(model, options, next);
    };

    /**
     * Removes an extension associated with your model instance can be accessed by
     * yourModelInstance.remove'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[REMOVE_METHOD] = function (options, next) {
        getExtension(this.db).removeExtension(this, options, next);
    };

    /**
     * Removes an extension associated with your model can be accessed by
     * YourModel.remove'extensionName'(model, options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.statics[REMOVE_METHOD] = function (model, options, next) {
        getExtension(this.db).removeExtension(model, options, next);
    };

    /**
     * Get extensions associated with your model instance can be accessed by
     * YourModelInstance.get'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[FIND_METHOD] = function (options, next) {
        options.modelId = this._id;
        getExtension(this.db).find(options, function (err, result) {
            if (err) {
                log.error(err);
            }
            next(err, result);
        });
    };

    /**
     * Get an extension associated with your model instance can be accessed by
     * YourModel.get'extensionName'(modelInstance, options, next) (without quotes, case sensitive)
     * @param next (err, extension)
     */
    schema.statics[FIND_METHOD] = function (model, options, next) {
        options.modelId = model._id;
        getExtension(this.db).find(options, next);
    };

    /**
     * Find a YourModelInstance by the extension.
     * YourModel.findBy'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, YourModelInstance )
     */
    schema.statics[FIND_BY_METHOD] = function (options, next) {
        var self = this;
        getExtension(this.db).findOne(options, function (err, result) {
            result.findModel(self, next);
        });
    };

    /**
     * Find YourModelInstance by Application apiKey
     * @param apiKey
     * @param next
     */
    schema.statics[API_KEY_FIND_BY_KEY_METHOD] = function (apiKey, next) {
        var self = this;
        getExtension(this.db).findByApiKey(apiKey, function (err, result) {
            if (result) {
                self.findOne({_id: result.modelId}, next);
            } else {
                next(err, result);
            }
        });
    };

    /**
     * Find YourModelInstance by Application apiSecret
     * @param apiSecret
     * @param next
     */
    schema.statics[API_KEY_FIND_BY_SECRET_METHOD] = function (apiSecret, next) {
        var self = this;
        getExtension(this.db).findByApiSecret(apiSecret, function (err, result) {
            if (result) {
                self.findOne({_id: result.modelId}, next);
            } else {
                next(err, result);
            }
        });
    };

    /**
     * Returns the extension instance so that you can perform usual
     * mongoose methods on it.
     * @param next
     */
    schema.methods[lowerTableName] = function (next) {
        next(null, getExtension(this.db));
    };

    /**
     * Returns the extension instance so that you can perform usual
     * mongoose methods on it.
     * @param next
     */
    schema.statics[lowerTableName] = function (next) {
        next(null, getExtension(this.db));
    };

    /**
     * Call the extension directly without having to pass a callback.
     * @returns {*}
     */
    schema.methods[upperTableName] = function () {
        return getExtension(this.db);
    };

    /**
     * Call the extension directly without having to pass a callback.
     * @returns {*}
     */
    schema.statics[upperTableName] = function () {
        return getExtension(this.db);
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    /**
     * Here is the magic. We pass the db instance from the associated methods
     * and if there is no extension type created we create a temporary mongoose
     * schema in order to build a valid Mongoose object without ever having
     * to import mongoose. This is required as if we import mongoose and the
     * user of the library imports mongoose they are not the same instance
     * and as such Mongoose.Schema === Mongoose.Schema is false which breaks
     * mongoose.
     * @private
     * @param db
     * @returns {*}
     */
    function getExtension(db) {
        if (!extension) {
            //Create temporary model so we can get a hold of a valid Schema object.
            var extensionSchema = db.model('____' + TYPE + '____', {}).schema;
            extensionSchema.statics.TYPE = TYPE;

            var extensionOptions = {
                type: {type: String, 'default': TYPE},
                modelId: String,
                name: {
                    type: String,
                    required: true,
                    unique: true,
                    trim: true
                },
                uniquename: {
                    type: String,
                    required: true,
                    unique: true,
                    lowercase: true,
                    trim: true
                },
                description: String,
                version: {
                    type: String,
                    'default': '0.0.0'
                }
            };

            extensionSchema.add(extensionOptions);
            //If a schema was passed in then add it to our extension.
            if (pluginOptions.schema) {
                extensionSchema.add(pluginOptions.schema);
            }

            extensionSchema.methods.findModel = function (Model, next) {
                Model.findOne({_id: this.modelId}, next);
            };

            extensionSchema.statics.createExtension = function (model, options, next) {
                options.modelId = model._id;
                options.uniquename = options.name.toLowerCase();
                this.create(options, function (err, result) {
                    if (err) {
                        log.error(err);
                    }
                    if (result) {
                        log.debug('Create apiKey', options);
                        if (pluginOptions.oauth || pluginOptions.apiKey) {
                            result.createApiKey(function (err, key) {
                                if (err || !key) {
                                    log.error('Error creating apiKey', err);
                                    next(err);
                                } else {
                                    result.save(next);
                                }
                            });
                        } else {
                            result.save(next);
                        }
                    } else {
                        next('Error creating api key');
                    }
                });
            };

            extensionSchema.statics.removeExtension = function (model, options, next) {
                options.modelId = model._id;
                this.remove(options, function (err, result) {
                    log.debug('Removing Application');
                    if (err) {
                        log.error(err);
                    }
                    log.debug(result);
                    next(err, result);
                });
            };

            /**
             * Find the Application from it's apiKey
             * @param token
             * @param next
             */
            extensionSchema.statics.findByApiKey = function (token, next) {
                if (pluginOptions.apiKey) {
                    this[API_KEY_FIND_BY_METHOD]({key: token}, next);
                } else {
                    next('api.error.invalid');
                }
            };

            /**
             * Find the Application from it's apiSecret
             * @param token
             * @param next
             */
            extensionSchema.statics.findByApiSecret = function (token, next) {
                if (pluginOptions.apiKey) {
                    this[API_KEY_FIND_BY_METHOD]({secret: token}, next);
                } else {
                    next('api.error.invalid');
                }
            };

            /**
             * Generate a new Application API Key
             * @param next
             */
            extensionSchema.methods.createApiKey = function (next) {
                if (pluginOptions.apiKey) {
                    this[API_KEY_CREATE_METHOD](next);
                } else {
                    next('api.error.invalid');
                }
            };

            /**
             * Return the consumer object.
             * @param next
             */
            extensionSchema.methods.consumer = function (next) {
                if (pluginOptions.apiKey) {
                    this[API_KEY_FIND_METHOD](function (err, result) {
                        if (err) {
                            log.error(err);
                            next(err);
                        } else {
                            next(null, result[0]);
                        }
                    });
                } else {
                    next('api.error.invalid');
                }
            };

            /**
             * Retrieve the Applications API KEY as a Consumer object
             * @param next
             */
            extensionSchema.methods.apiKey = function (next) {
                this.consumer(next);
            };

            /**
             * Retrieve the Applications API Secret as a Consumer object
             * @param next
             */
            extensionSchema.methods.apiSecret = function (next) {
                this.consumer(next);
            };

            if (pluginOptions.oauth || pluginOptions.apiKey) {
                extensionSchema.plugin(OAuth.plugin, {
                    oauth: pluginOptions.oauth,
                    tableName: upperTableName,
                    passport: pluginOptions.passport
                });
            }

            extension = db.model(TYPE, extensionSchema);
        }
        return extension;
    }
};
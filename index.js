
/**
 * DSL context.
 */

var context;

/**
 * Current language.
 */

var locale;

/**
 * Expose `text`.
 */

exports = module.exports = text;

/**
 * Example:
 *
 *    text('messages')
 *
 * @param {String} key A word or a string containing no whitespace.
 * @param {String} val The text value.
 * @api public
 */

function text(key, val) {
  return undefined === val
    ? (locale[key] || (locale[key] = new Text))
    : (locale[key] = new Text).one(val);
}

/**
 * Check if locale exists.
 *
 * @param {String} key The locale key.
 * @return {Boolean} true if locale exists, else false.
 * @api public
 */

exports.has = function(key){
  return !!locale[key];
};

/**
 * Set locale.
 *
 * @chainable
 * @param {String} val A text locale key.
 * @return {Function} exports The main `text` function.
 * @api public
 */

exports.locale = function(val){
  locale = exports[val] || (exports[val] = {});
  return exports;
};

/**
 * Default locale is `en`.
 */

exports.locale('en');

/**
 * Class representing text.
 *
 * @class
 * @api public
 */

function Text() {
  this.inflections = [];
}

/**
 * Return a past tense text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.past = function(string){
  return this.inflection(string, context.count, 'past');
};

/**
 * Return a present tense text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.present = function(string){
  return this.inflection(string, context.count, 'present');
};

/**
 * Return a future tense text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.future = function(string){
  return this.inflection(string, context.count, 'future');
};

/**
 * Return any tense text.
 *
 * Tenses: past, present, future
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @param {String} tense A tense: past, present, future
 * @param {String} count The pluralization count.
 * @return {Text}
 * @api public
 */

Text.prototype.tense = function(string, tense, count){
  return this.inflection(string, count, tense);
};

/**
 * Return a zero pluralized text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.none = function(string){
  return this.inflection(string, 'none');
};

/**
 * Return a singular text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.one = function(string){
  return this.inflection(string, 'one');
};

/**
 * Return a pluralized text.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @return {Text}
 * @api public
 */

Text.prototype.other = function(string){
  return this.inflection(string, 'other');
};

/**
 * Return an inflected string.
 *
 * @chainable
 * @param {String} string Any supported language text.
 * @param {String} count The pluralization count.
 * @param {String} tense Specified tense string.
 * @return {Text}
 * @api public
 */

Text.prototype.inflection = function(string, count, tense){
  // this isn't quite correct...
  this.inflections.push(context = {
    string: string,
    count: count == null ? 'all' : count,
    tense: tense || 'present'
  });

  return this;
};

/**
 * This could be a view on the client.
 *
 * @param {Object} options Rendering options.
 * @return {String} The inflected text string.
 * @api public
 */

Text.prototype.render = function(options){
  options || (options = {});

  var count = (options.count ? (1 === options.count ? 'one' : 'other') : 'none')
    , tense = options.tense || 'present'
    , key = tense + '.' + count
    , inflections = this.inflections
    , inflection = inflections[0]
    , currScore = 0
    , prevScore = 0;

  for (var i = 0, n = inflections.length; i < n; i++) {
    currScore = 0
      + (count === inflections[i].count ? 1 : 0)
      + (tense === inflections[i].tense ? 1 : 0);

    if (currScore > prevScore) {
      inflection = inflections[i];
      prevScore = currScore; 
    }
  }

  return inflection.string.replace(/\{\{(\w+)\}\}/g, function(_, $1){
    return options[$1];
  });
};
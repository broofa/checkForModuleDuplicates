function checkForModuleDuplicates() {
  var grouped = {}, duped = {}, dupes = false;

  for (var key in require.cache) {
    var loweredKey = key.toLowerCase();
    if (loweredKey in grouped) {
      dupes = true;
      grouped[loweredKey].push(key);
      duped[loweredKey] = grouped[loweredKey];
    }
    grouped[loweredKey] = [key];
  }

  if (dupes) {
    throw Error('Inconsistent upper/lower casing found for modules in require.cache: ' + JSON.stringify(duped));
  }
}

// Allow devs to call checkForModuleDuplicates.autocheck() to complain bitterly if/when a module
var autoTimer, autoDelay = 500;
function autocheck() {
  checkForModuleDuplicates();

  autoDelay = Math.min(60000, autoDelay * 2)
  setTimeout(autocheck, autoDelay)
}

checkForModuleDuplicates.autocheck = autocheck;

module.exports = checkForModuleDuplicates;

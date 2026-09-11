/* ---------------------------------------------------------------------------
   launch-date.js
   Scene 13 changes on launch day without anybody editing it.

   Scene 13 is the only scene whose copy has a date attached to it. Before 14
   September 2026 it describes a thing that does not exist; from the 14th it
   describes a thing that does, and the safety warning has to change with it.
   The pre-launch warning says there is nothing legitimate to mint, which is
   protective in the days before launch and actively wrong afterwards: it would
   describe the real mint as a fake, and a reader who notices the page is stale
   discounts the whole warning with it.

   Local date, nothing fetched. Being a few hours early or late either side of
   midnight in some timezone costs nothing. Being wrong for a week because
   somebody forgot to edit the page is the failure worth engineering against.

   THE DEFAULT IS THE LAUNCH DAY FORM. Both versions are in the markup and the
   CSS shows the launched one unless this script says otherwise, so the failure
   mode with scripting off is "tells you to check the contract address slightly
   before there is one", not "tells you the real mint is a fake". The unsafe
   direction is the one that must not happen by default.

   This is the one scene that runs script and is not registered with SceneLoop.
   It has no clock, no simulation and no render: it reads a date once and sets an
   attribute. Scene 3 still runs nothing at all.
   --------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  /* Local midnight on 14 September 2026. Month is zero based, so 8 is
     September. */
  var LAUNCH = new Date(2026, 8, 14, 0, 0, 0, 0);

  var preLaunch = new Date() < LAUNCH;

  /* One attribute, on the root, so the scene 13 markup and the narrator both
     read the same answer from the same place and cannot disagree. */
  document.documentElement.setAttribute('data-prelaunch', preLaunch ? 'true' : 'false');

  global.LaunchDate = {
    launchesOn: LAUNCH,
    preLaunch: function () { return preLaunch; }
  };

})(window);

# Live Emoji Reactions

A site that allows multiple users to generate bursts of emojis, synced in realtime across browsers.

Some features:
- On mousedown, a random emoji is generated in a burst, moving up and fading away.
- A user can indicate a username via an HTML form, which is then used to label their cursor.
- I randomly assign a cursor color for each new user.
- The cursors and emojis generated are visible across browsers, when multiple users are on the same URL.

I used HTML, CSS, Javascript to create the website and the interactive components. 
I used Firebase Realtime Database to store and update data in realtime (i.e. keeping track of a user's cursor position, the location of emojis). 

I initially tested this with Safari, so it works best on there! It should work fine on other browsers.

There are lots of ways in which these features can be built upon - this is just a start!

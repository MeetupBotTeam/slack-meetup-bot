# MeetupBot for Slack
MeetupBot is a slack bot which gives you the list of meetups going on nearby your location.
It's a slack bot built using Google Geocode API and Meetup API.
It allows you to search for list of meetup events/groups nearby your location based on your interest.

Preview<br/>
<img alt="MeetupBot Slack Chat View" src="https://user-images.githubusercontent.com/14115048/28485099-a21ca0f0-6e94-11e7-8a69-85536fe326e0.png" width="700" height="350"/>

## Installations
You can install it by hitting the Add to Slack Button on the Landing page [here]https://meetupbotteam.github.io/meetupbot-landing-page/).

Following are the available slack commands

+ Type /meetupbot <br/> to call the MeetupBot which will respond back with a list of commands and how to use it.
+ Type /meetupbot-show &lt;location&gt; & &lt;interest&gt; <br/>
use this to find meetup-events based on your location and interests
for ex: /meetupbot-show Mumbai & Javascript (Don't forget to use ampersand (&).)
+ Type /meetupbot-find &lt;location&gt; (& &lt;group&gt;) <br/>
use this to find local meetup-groups based on your location
for ex: /meetupbot-find New-York
optional: add parameter for your interests: '/meetupbot-find New-York & &lt;interest&gt;'

## Setups
If you wish to make your own slack-meetup-bot, clone this repo and run npm install in the root folder.
Set up your slack app from [here](https://api.slack.com/apps) to get client_id and client_secret and also get your APIKey for [Meetup API](https://www.meetup.com/meetup_api/)

## Privacy Policy
Updating in progress.

## Feedback & Support
Please send us your questions, bug reports, feature requests. Let us know what we can do to improve MeetupBot.

## License
Built by [Premprakash Singh](https://github.com/PREMPRAKASHSINGH), [Linus Brennecke](https://github.com/nusli), [Zameer Haque](https://github.com/zamhaq)<br/>
Updating in progress.

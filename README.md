# SwipeClean App - Tidy up your photos

Your phone memory is full of countless pictures of your bills, your accidental screenshots or selfies from strangers, shared in Whatsapp groups?
Tidy up your phone today with SwipeClean App! You decide what to keep and what to delete, with a simple swiping gesture.

## Features
* App presents you 16 random photos from a photo folder of your choice
* Swipe through all of the 16 photos and decide which one you want to keep
* The app never deletes photos on its own! It puts them in a separate folder that you specified. You can review and delete them manually.

## Planned Features
* Remember my choices: Photos you want to keep, will not be presented again
* Share memories: Photos you like can be shared with friends or uploaded on google drive
* Multiple folders: Specify multiple photo folders as source
* Search with AI: Use GenAI to sort your photos

## For Developers

### Run and debug
Currently only the Android version is really supported.

Run the app with metro (for debugging purposes only). Run this command in the top level project folder:

```
npm run android
```

If you want to build an .apk, you first need to bundle the frontend code and your android assets. Run this in top level folder:
```
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```
Then, navigate into the android folder and let gradle greate an executable .apk
```
./gradlew.bat assembleDebug
```
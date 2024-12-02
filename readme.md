# Readme

This is the PayPal-inspector, an Electron application for inspecting PayPal integrations.

## command line options:
npm start - run from command line
npm run make:mac - build a universal DMG for Mac OS

## Running the main app
Once the main app window is shown enter a website URL in the input field, then press return. When prompted on the modal, enter a name for the session, and a description, then press the Start Session button. When the page is loaded, information about the webpage will be shown in the progress panel on the right part of the app window. When you navigate the web page and load another page, the progress panel should show another card with details that and subsequent pages that are navigated. Click on End Session button to end / clear the session data.

## Developer Tools
In the View menu, there are 2 menu items for viewing developer tools, 
* Toggle Developer Tools - this toggles developer tools for the main app window; this can be used while the app is running.
* Toggle Content DevTools - this toggles developer tools for the loaded webpage; this can only be used when there is an active session.

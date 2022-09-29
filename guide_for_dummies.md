## Step by step guide to setting up `node.js to Bitburner connection`, for dummies

### 1. Backup your savegame  
- Augmentations -> Backup save

### 2. Install node.js from https://nodejs.org/en/  
- Download the version that's recommended for most users.
- Install it. Just click next, next, next, next, finish.
	
### 3. Download this:  
https://github.com/bitburner-official/typescript-template  
- Click the green code button -> download zip
- Extract the zip anywhere, for example `c:\node\`
	
### 4. Download this:  
https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts  
- Press ctrl+s, save this into same directory you just created, for example `c:\node\`
	
### 5. Run the node server --------is it called a server?---------	
- Open command prompt / terminal
  - Windows: Open start menu and type `cmd` (enter)  
  - Mac: --------check if this is correct!--------- Click the Launchpad icon in the Dock, type `Terminal` in the search field, then click Terminal.
- To go to the directory you just created:  
  - Windows: type `cd ` and drag the folder you created to the cmd window, or type `cd c:\node` or whatever folder you chose previously.  
  - Mac: --------check if this is correct! and the cd command twice--------- drag the folder you created to the terminal window, or type `cd \node` or whatever folder you chose previously.  
- type `npm install typescript`
- type `npm run watch`
- If the npm asks if you want to install something it needs, answer `y` for yes.
- Your firewall may yell at you; allow the connection.

### 6. Go back to Bitburner.
- Options -> remote api -> type in the port: `12525` -> click connect. The icon should turn green and say it's online.
- Your firewall may yell at you again; allow the connection.

### 7. That's it!
- You should see a file `template.js` in the root of your `home` server in Bitbuner.

### 8. Test that the connection works
- Copy/create a .js and a .txt file to `c:\node\dist\` directory - or whatever directory you chose in step 3 - on your computer and check Bitburner. The file should be transferred.

### 9. If you want to use typescript
- Open another cmd/terminal window just like you did in step 4.
- This time run the command `npm run transpile`. Yes, you need them both to be running at the same time.
- Put your .ts files to the `src\` directory.
	
### 10. Thats it! Again.
- Edit the file `template.ts` in the `src\` directory and check that the contents of the file `template.js` in Bitburner are changed to match your edit.
<br>
<br>
### For more information, read the readme of this https://github.com/bitburner-official/typescript-template and feel free to ask in Bitburner Discord channel `#external-editors:` https://discord.com/channels/415207508303544321/923428435618058311
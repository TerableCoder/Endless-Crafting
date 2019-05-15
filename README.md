# Endless-Crafting

This module will keep crafting the last crafted item and use Crafter's Cure (Elite is default, replace id in file to change deafult). 
Also requires command module

Make sure to drop S_FATIGABILITY_POINT.3.def into your proxies \node_modules\tera-data\protocol folder

Make sure to get your Opcodes from https://github.com/TerableCoder/TerableOpcodes

## Usage
1. Type: /8 craft

2. Craft the item you want to continuously craft once

3. To disable type: /8 craft

## Config
### `enable`
- Is the module on by default or not?
### `cureId`
- The default is elite crafters cure: 182439, you can change the default to normal crafters cure: 181100
### `delay`
- The default is 0, if you're having issues with the mod, try increasing this number

## Additional commands:
### `/8 craft linkedItem` 
- Switches pp consumable (You can link items in chat with Ctrl+LMB)

### `/8 craft unlock` 
- If your character is still stuck 5 seconds after disabling

Created by Sunpui

Fixed and upgraded by TerableCoder
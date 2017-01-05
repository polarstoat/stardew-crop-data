# :seedling: Stardew Valley crop data

> Parses *Stardew Valley* data files and extracts the crop data as JSON for use in web apps

[![Stardew Valley](https://img.shields.io/badge/stardew_valley-v1.11-blue.svg)](http://stardewvalleywiki.com/Version_History#Version_1.11)

## Usage

1. Extract `Data/Crops.xnb` and `Data/ObjectInformation.xnb` using [XNBNode](http://www.mediafire.com/download/v4ttswl7tsdaynm/XNBNode.0.2.1.7z) *(unfortunately XNBNode currently only works on Windows)* from the Stardew Valley game folder
   * macOS: `~/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents`
   * Linux: `~/.steam/steam/steamapps/common/Stardew Valley/Content`
   * Windows: `C:\Programs Files\Steam\SteamApps\common\Stardew Valley\Content`
1. Copy `Crops.yaml` and `ObjectInformation.yaml` into this folder
1. Install dependencies

   ```sh
   npm install
   ```

1. Parse the data

   ```sh
   npm start
   ```

   The parsed data is saved to `crops.json`

## Example data

The data for Parsnip is given as an example of the structure created.

```json
{
  "24": {
    "name": "Parsnip",
    "description": "A spring tuber closely related to the carrot. It has an earthy taste and is full of nutrients.",
    "id": 24,
    "category": "Basic -75",
    "rowInSpriteSheet": 0,
    "seasonsToGrowIn": [
      "spring"
    ],
    "phaseDays": [
      1,
      1,
      1,
      1
    ],
    "regrowAfterHarvest": -1,
    "sellPrice": 35,
    "edibility": 10,
    "scythe": false,
    "trellis": false,
    "harvest": {},
    "seed": {
      "name": "Parsnip Seeds",
      "description": "Plant these in the spring. Takes 4 days to mature.",
      "id": 472,
      "category": "Seeds -74",
      "sellPrice": 10,
      "edibility": -300
    },
    "flowerColors": []
  }
}
```

## Notes

#### Energy restored

The amount of energy restored by consumable crops (which do not have a `healthRestored` value of `-300`) is 2.5x the amount of health restored.

#### Category names

* Basic -17: *(no name displayed in game interface [Sweet Gem Berry is the only crop with this category])*
* Basic -75: Vegetable
* Basic -79: Fruit
* Basic -80: Flower
* Basic -81: Forage
* Seeds -74: Seed

Category names could be added with something like the following code snippet:

```js
const CATEGORY_NAMES = {
  'Basic -17': '',
  'Basic -75': 'Vegetable',
  'Basic -79': 'Fruit',
  'Basic -80': 'Flower',
  'Basic -81': 'Forage',
  'Seeds -74': 'Seed',
};

categoryName = CATEGORY_NAMES[category];
```

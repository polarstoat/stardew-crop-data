# :seedling: Stardew Valley crop data

Parses *Stardew Valley* data files and extracts the crop data as JSON for use in web apps

[![Stardew Valley](https://img.shields.io/badge/stardew_valley-v1.3.36-blue.svg)](https://stardewvalleywiki.com/Version_History#1.3.36)

## Usage

1. Extract `Data/Crops.xnb` and `Data/ObjectInformation.xnb` using [XNBNode](https://www.mediafire.com/file/fwg3p0rmp3q2v36/xnb_node.0.2.2.7z) *(unfortunately XNBNode currently only works on Windows)* from the Stardew Valley game folder
   * macOS: `~/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents`
   * Linux: `~/.steam/steam/steamapps/common/Stardew Valley/Content`
   * Windows: `C:\Programs Files\Steam\SteamApps\common\Stardew Valley\Content`
1. Copy `Crops.json` and `ObjectInformation.json` into this folder
1. Install dependencies

   ```sh
   npm install
   ```

1. Parse the data

   ```sh
   npm start
   ```

   The parsed data is saved to `parsed-crop-data.json`

## Example data

The data for Parsnip is given as an example of the structure created.

```json
{
  "24": {
    "name": "Parsnip",
    "description": "A spring tuber closely related to the carrot. It has an earthy taste and is full of nutrients.",
    "id": 24,
    "category": "Basic -75",
    "sellPrice": 35,
    "edibility": 10,
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
    "scythe": false,
    "trellis": false,
    "canBeGiant": false,
    "harvest": {},
    "seed": {
      "name": "Parsnip Seeds",
      "description": "Plant these in the spring. Takes 4 days to mature.",
      "id": 472,
      "category": "Seeds -74",
      "sellPrice": 10,
      "edibility": -300,
      "vendor": {
        "generalStore": {
          "price": 20,
          "yearAvailable": 1
        },
        "jojaMart": {
          "price": 25
        },
        "travelingCart": {
          "minPrice": 100,
          "maxPrice": 1000
        }
      }
    },
    "flowerColors": []
  }
}
```

## Notes

#### Health/Energy restored

Crops with `edibility === -300` are not consumable and thus do not restore any health or energy.

The amount of health restored by a crop is `(edibility > 0) ? edibility : 0`. It is never negative.

The amount of energy restored by a crop is `2.5 * edibility`. It can sometimes be negative and remove energy.

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

#### JojaMart membership

With a JojaMart membership seed prices become the same as Pierre's General Store*, which is `seed.sellPrice * 2`.

\* Except for Sunflower Seeds which are 125g without membership and 100g with membership, compared to 200g at the General Store

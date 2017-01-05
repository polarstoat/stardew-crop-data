# :seedling: Stardew Valley crop data

> Parses *Stardew Valley* data files and extracts the crop data as JSON for use in web apps

## Usage

1. Open the Stardew Valley game folder
   * macOS: `~/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents`
   * Linux: `~/.steam/steam/steamapps/common/Stardew Valley/Content`
   * Windows: `C:\Programs Files\Steam\SteamApps\common\Stardew Valley\Content`
1. Use [XNBNode](https://github.com/draivin/XNBNode) to extract `Data/Crops.xnb` and `Data/ObjectInformation.xnb` to `Crops.yaml` and `ObjectInformation.yaml`
1. Copy `Crops.yaml` and `ObjectInformation.yaml` into this folder
1. Install dependencies

   ```sh
   npm install
   ```

1. Parse the data

   ```sh
   npm start
   ```

   The parsed data is saved to `parsed-crops.json`

## Notes

#### Energy restored

The amount of energy restored by consumable crops (which do not have a `healthRestored` value of `-300`) is 2.5x the amount of health restored.

#### Human-friendly categories

* Basic -17: *(category not shown in interface)*
* Basic -75: Vegetable
* Basic -79: Fruit
* Basic -80: Flower
* Basic -81: Forage
* Seeds -74: Seed

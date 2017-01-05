#!/usr/bin/env node

// Core modules
const fs = require('fs');

// Custom modules
const jsonfile = require('jsonfile');
const YAML = require('yamljs');

const PARSED_CROPS_PATH = 'parsed-crops.json';

// Stardew Valley data files containers
let crops = {};
let objectInformation = {};

// If files exist in JSON
if (fs.existsSync('Crops.json') && fs.existsSync('ObjectInformation.json')) {
  crops = jsonfile.readFileSync('Crops.json');
  objectInformation = jsonfile.readFileSync('ObjectInformation.json');

// If files exist in YAML
} else if (fs.existsSync('Crops.yaml') && fs.existsSync('ObjectInformation.yaml')) {
  crops = YAML.load('Crops.yaml');
  objectInformation = YAML.load('ObjectInformation.yaml');

// If files don't exist
} else {
  console.error(new Error('Stardew Valley data files not found'));
  process.exit(1);
}

const parsedCrops = {};

Object.keys(crops.content).forEach((key) => {
  const cropData = crops.content[key].split('/');
  const cropInfoData = objectInformation.content[cropData[3]].split('/');
  const seedInfoData = objectInformation.content[key].split('/');

  const cropYieldData = cropData[6].split(' ').map(Number);
  // Remove the 'true' in 'true 3 5 5 .02'
  cropYieldData.shift();

  const cropFlowerColorData = cropData[8].split(' ').map(Number);
  // Remove the 'true' in
  // 'true 35 127 255 109 131 255 112 207 255 191 228 255 94 121 255 40 150 255'
  cropFlowerColorData.shift();

  const crop = {};

  /**
   * Crop's name
   * @type {string}
   */
  crop.name = cropInfoData[0];

  /**
   * Crop's description
   * @type {string}
   */
  crop.description = cropInfoData[4];

  /**
   * Crop's ID and key in ObjectInformation.content and index in springobjects.png tilesheet
   * @type {number}
   */
  crop.id = Number(cropData[3]);

  /**
   * Crop's category in player's inventory
   * @type {string}
   */
  crop.category = cropInfoData[3];

  /**
   * Crop's index in crops.png tilesheet
   * @type {number}
   */
  crop.cropsTilesheetIndex = Number(cropData[2]);

  /**
   * Seasons crop can grow in
   * @type {string[]}
   */
  crop.seasons = cropData[1].split(' ');

  /**
   * Each item represents days spent in each stage of growth
   * @type {number[]}
   */
  crop.growthStages = cropData[0].split(' ').map(Number);

  /**
   * Days taken after first harvest for crop to produce again. If crop doesn't produce again this
   * will be -1
   * @type {number}
   */
  crop.regrowTime = Number(cropData[4]);

  /**
   * Crop's sell value
   * @type {number}
   */
  crop.sellPrice = Number(cropInfoData[1]);

  /**
   * Amount of health restored on consumption
   * Amount of energy restored on consumption is this * 2.5
   * Negative values cause energy loss but not health loss
   * For non-consumable crops this value will be -300
   * @type {number}
   */
  crop.healthRestored = Number(cropInfoData[2]);

  /**
   * Is the crop harvested with the scythe
   * @type {boolean}
   */
  crop.scythe = Boolean(Number(cropData[5]));

  /**
   * Does the crop grow on a trellis. May technically be whether the crop has a solid bounding box
   * @type {boolean}
   */
  crop.trellis = (cropData[7] === 'true');

  crop.yield = {};

  if (cropYieldData.length === 4) {
    /**
     * Minimum yield from each harvest
     * @type {number}
     */
    crop.yield.minimum = cropYieldData[0];

    /**
     * Maximum yield from each harvest
     * @type {number}
     */
    crop.yield.maximum = cropYieldData[1];

    /**
     * Field purpose unknown. Named after https://github.com/exnil/crop_planner/blob/e707442e434415a83f01e0dca81d7ce0263ff1f1/scripts/planner.js#L967
     * @type {number}
     */
    crop.yield.levelIncrease = cropYieldData[2];

    /**
     * Field purpose unknown. Something to do with chance to get more than the minimum yield perhaps. Named after https://github.com/exnil/crop_planner/blob/e707442e434415a83f01e0dca81d7ce0263ff1f1/scripts/planner.js#L968
     * @type {number}
     */
    crop.yield.extraChance = cropYieldData[3];
  }

  crop.seed = {};

  /**
   * Seed's name
   * @type {string}
   */
  crop.seed.name = seedInfoData[0];

  /**
   * Seed's description
   * @type {string}
   */
  crop.seed.description = seedInfoData[4];

  /**
   * Seed's ID
   * @type {number}
   */
  crop.seed.id = Number(key);

  /**
   * Seed's category. In Stardew Valley v1.11 this is always 'Seeds -74'
   * @type {string}
   */
  crop.seed.category = seedInfoData[3];

  /**
   * Seed's sell value
   * @type {number}
   */
  crop.seed.sellPrice = Number(seedInfoData[1]);

  /**
   * Would be the amount of health restored on consumption
   * However no seeds are consumable so will always be -300
   * @type {number}
   */
  crop.seed.healthRestored = Number(seedInfoData[2]);

  /**
   * Crop's flower colors
   * @type {{red: number, green: number, blue: number}}
   */
  crop.flowerColors = (() => {
    const colors = [];
    for (let i = 0; i < cropFlowerColorData.length / 3; i += 1) {
      const j = i * 3;
      colors.push({
        red: cropFlowerColorData[j],
        green: cropFlowerColorData[j + 1],
        blue: cropFlowerColorData[j + 2],
      });
    }
    return colors;
  })();

  parsedCrops[crop.id] = crop;
});

jsonfile.writeFileSync(PARSED_CROPS_PATH, parsedCrops, { spaces: 2 });
console.log(`🌱  Parsed ${Object.keys(parsedCrops).length} crops and saved to ${PARSED_CROPS_PATH}`);

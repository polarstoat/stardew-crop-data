#!/usr/bin/env node

// Core modules
const fs = require('fs');
const path = require('path');

// Custom modules
const jsonfile = require('jsonfile');
const YAML = require('yamljs');

const PARSED_CROPS_PATH = path.resolve(__dirname, 'crops.json');
const CROPS_PATH = path.resolve(__dirname, 'Crops.yaml');
const OBJECT_INFORMATION_PATH = path.resolve(__dirname, 'ObjectInformation.yaml');

// Check Stardew Valley data files exist
[CROPS_PATH, OBJECT_INFORMATION_PATH].forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(new Error(`${filePath} does not exist`));
    process.exit(1);
  }
});

// Stardew Valley data files
const crops = YAML.load(CROPS_PATH);
const objectInformation = YAML.load(OBJECT_INFORMATION_PATH);

const parsedCrops = {};

Object.keys(crops.content).forEach((key) => {
  const cropData = crops.content[key].split('/');
  const cropInfoData = objectInformation.content[cropData[3]].split('/');
  const seedInfoData = objectInformation.content[key].split('/');

  const cropHarvestData = cropData[6].split(' ').map(Number);
  // Remove the 'true' in 'true 3 5 5 .02'
  cropHarvestData.shift();

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
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  crop.rowInSpriteSheet = Number(cropData[2]);

  /**
   * Seasons crop can grow in
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {string[]}
   */
  crop.seasonsToGrowIn = cropData[1].split(' ');

  /**
   * Each item represents days spent in each stage of growth
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number[]}
   */
  crop.phaseDays = cropData[0].split(' ').map(Number);

  /**
   * Days taken after first harvest for crop to produce again. If crop doesn't produce again this
   * will be -1
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  crop.regrowAfterHarvest = Number(cropData[4]);

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
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  crop.edibility = Number(cropInfoData[2]);

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

  crop.harvest = {};

  if (cropHarvestData.length === 4) {
    /**
     * Minimum yield from each harvest
     * @type {number}
     */
    crop.harvest.minHarvest = cropHarvestData[0];

    /**
     * Maximum yield from each harvest
     * @type {number}
     */
    crop.harvest.maxHarvest = cropHarvestData[1];

    /**
     * Field purpose not entirely known. Named after decompiled Crop.cs from Stardew Valley.exe
     * @type {number}
     */
    crop.harvest.maxHarvestIncreasePerFarmingLevel = cropHarvestData[2];

    /**
     * Field purpose not entirely known. Named after decompiled Crop.cs from Stardew Valley.exe
     * @type {number}
     */
    crop.harvest.chanceForExtraCrops = cropHarvestData[3];
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
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  crop.seed.edibility = Number(seedInfoData[2]);

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

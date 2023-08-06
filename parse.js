#!/usr/bin/env node

// Core modules
const fs = require('fs');
const path = require('path');

// Custom modules
const jsonfile = require('jsonfile');
const Xnb = require('xnbcli/app/Xnb');
const xnbLog = require('xnbcli/app/Log');

// eslint-disable-next-line no-bitwise
xnbLog.setMode(xnbLog.INFO | xnbLog.WARN | xnbLog.DEBUG, false);

// Constants (data from decompiled Stardew Valley.exe v1.2.30)
const GIANT_CROP_IDS = [190, 254, 276];
const YEAR_2_CROP_IDS = [476, 485, 489];
const GENERAL_STORE_STOCK_IDS = [299, 301, 302, 425, 427, 429, 431, 453, 455, 472, 473, 474, 475,
  476, 477, 479, 480, 481, 482, 483, 484, 485, 487, 488, 489, 490, 491, 492, 493];
const JOJAMART_STOCK_IDS = [245, 246, 297, 299, 301, 302, 423, 425, 427, 429, 431, 453, 455, 472,
  473, 474, 475, 477, 479, 480, 482, 483, 484, 487, 488, 490, 491, 492, 493];
const NOT_SOLD_AT_TRAVELING_CART_IDS = [158, 159, 160, 161, 162, 163, 326, 341, 413, 437, 439, 454,
  460, 645, 680, 681, 682, 688, 689, 690, 774, 775, 802];
const OASIS_STOCK_IDS = [478, 486, 494, 802];

const OUTPUT_PATH = path.resolve(__dirname, 'parsed-crop-data.json');
const CROPS_PATH = path.resolve(__dirname, 'Crops.xnb');
const OBJECT_INFORMATION_PATH = path.resolve(__dirname, fs.readdirSync(__dirname).filter(file => file.match(/ObjectInformation(\.[a-z]{2}\-[A-Z]{2})?\.xnb/))[0] || "ObjectInformation.xnb");

// Check Stardew Valley data files exist
[CROPS_PATH, OBJECT_INFORMATION_PATH].forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`Stardew Valley data file '${filePath}' does not exist`);
    process.exit();
  }
});

// Load Stardew Valley data files
const crops = new Xnb().load(CROPS_PATH);
const objectInformation = new Xnb().load(OBJECT_INFORMATION_PATH);

// Test format of data files, to detect potential changes/compatability
Object.entries(crops.content).forEach((entry) => {
  const [key, value] = entry;

  if (!/^\d+$/.test(key)) console.error(`Unexpected format of key '${key}' in crops.content (${CROPS_PATH})`);

  if (!/^[\d ]+\/(?:(?:spring|summer|fall|winter) ?)+\/\d+\/\d+\/-?\d+\/[01]\/(?:true \d \d \d+ ?.\d+|false)\/(?:true|false)\/(?:true(?: \d+)+|false)$/.test(value)) console.error(`Unexpected format of value '${value}' in crops.content[${key}] (${CROPS_PATH})`);
});
Object.entries(objectInformation.content).forEach((entry) => {
  const [key, value] = entry;

  if (!/^\d+$/.test(key)) console.error(`Unexpected format of key '${key}' in objectInformation.content (${OBJECT_INFORMATION_PATH})`);
  if (!/^.+\/\d+\/-?\d+\/\w+(?: -\d+)?\/.+\/.+$/.test(value)) console.error(`Unexpected format of value '${value}' in objectInformation.content[${key}] (${OBJECT_INFORMATION_PATH})`);
});

const output = {};

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
   * Crop's name (localized)
   * @type {string}
   */
  crop.name = cropInfoData[4];

  /**
   * Crop's description
   * @type {string}
   */
  crop.description = cropInfoData[5];

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
   * Is the crop harvested with the scythe
   * @type {boolean}
   */
  crop.scythe = Boolean(Number(cropData[5]));

  /**
   * Does the crop grow on a trellis. May technically be whether the crop has a solid bounding box
   * @type {boolean}
   */
  crop.trellis = (cropData[7] === 'true');

  /**
   * Whether the crop can become giant
   * @type {boolean}
   */
  crop.canBeGiant = (GIANT_CROP_IDS.indexOf(crop.id) > -1);

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
   * Seed's name (localized)
   * @type {string}
   */
  crop.seed.name = seedInfoData[4];

  /**
   * Seed's description
   * @type {string}
   */
  crop.seed.description = seedInfoData[5];

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

  crop.seed.vendor = {};

  // Seeds sold at Pierre's General Store
  if (GENERAL_STORE_STOCK_IDS.indexOf(crop.seed.id) > -1) {
    crop.seed.vendor.generalStore = {
      price: crop.seed.sellPrice * 2,
      yearAvailable: 1,
    };

    // Correct Sunflower Seeds price
    if (crop.seed.id === 431) crop.seed.vendor.generalStore.price = 200;
    // Correct year available for Garlic Seeds, Red Cabbage Seeds and Artichoke Seeds
    if (YEAR_2_CROP_IDS.indexOf(crop.seed.id) > -1) crop.seed.vendor.generalStore.yearAvailable = 2;
  }

  // Seeds sold at JojaMart
  if (JOJAMART_STOCK_IDS.indexOf(crop.seed.id) > -1) {
    crop.seed.vendor.jojaMart = {
      price: Math.floor(crop.seed.sellPrice * 2.5),
    };

    // Correct Sunflower Seeds price
    if (crop.seed.id === 431) crop.seed.vendor.jojaMart.price = 125;
  }

  // Seeds sold at the Traveling Cart
  if (NOT_SOLD_AT_TRAVELING_CART_IDS.indexOf(crop.seed.id) === -1 && crop.seed.sellPrice > 0) {
    crop.seed.vendor.travelingCart = {
      minPrice: Math.max(1 * 100, crop.seed.sellPrice * 3),
      maxPrice: Math.max(10 * 100, crop.seed.sellPrice * 5),
    };
  }
  // Rare Seed (grows Sweet Gem Berry)
  if (crop.seed.id === 347) crop.seed.vendor.travelingCart.price = 1000;
  // Coffee Bean
  else if (crop.seed.id === 433) crop.seed.vendor.travelingCart.price = 2500;

  // Seeds sold at Oasis (Desert shop)
  if (OASIS_STOCK_IDS.indexOf(crop.seed.id) > -1) {
    crop.seed.vendor.oasis = {
      price: crop.seed.sellPrice * 2,
    };

    // Correct Cactus Seeds price
    if (crop.seed.id === 802) crop.seed.vendor.oasis.price = 150;
  }

  // Seeds sold at the Egg Festival (Strawberry Seeds)
  if (crop.seed.id === 745) {
    crop.seed.vendor.eggFestival = {
      price: 100,
    };
  }

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

  output[crop.id] = crop;
});

jsonfile.writeFile(OUTPUT_PATH, output, { spaces: 2 }).then(() => {
  console.log(`🌱  Parsed ${Object.keys(output).length} crops and saved to '${OUTPUT_PATH}'`);
});

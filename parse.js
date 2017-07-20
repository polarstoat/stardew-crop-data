#!/usr/bin/env node

// Core modules
const fs = require('fs');
const path = require('path');

// Custom modules
const jsonfile = require('jsonfile');
const yamljs = require('yamljs');

// Constants (data from decompiled Stardew Valley.exe v1.2.30)
const GIANT_CROP_IDS = [190, 254, 276];
const YEAR_2_CROP_IDS = [476, 485, 489];
const GENERAL_STORE_STOCK_IDS = [299, 301, 302, 425, 427, 429, 431, 453, 455, 472, 473, 474, 475,
  476, 477, 479, 480, 481, 482, 483, 484, 485, 487, 488, 489, 490, 491, 492, 493];
const JOJAMART_STOCK_IDS = [245, 246, 297, 299, 301, 302, 423, 425, 427, 429, 431, 453, 455, 472,
  473, 474, 475, 477, 479, 480, 482, 483, 484, 487, 488, 490, 491, 492, 493];
const NOT_SOLD_AT_TRAVELING_CART_IDS = [158, 159, 160, 161, 162, 163, 326, 341, 413, 437, 439, 454,
  460, 645, 680, 681, 682, 688, 689, 690, 774, 775];
const OASIS_STOCK_IDS = [478, 486, 494];

const OUTPUT_PATH = path.resolve(__dirname, 'crops.json');
const CROPS_PATH = path.resolve(__dirname, 'Crops.yaml');
const OBJECT_INFORMATION_PATH = path.resolve(__dirname, 'ObjectInformation.yaml');

// Check Stardew Valley data files exist
[CROPS_PATH, OBJECT_INFORMATION_PATH].forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(new Error(`${filePath} does not exist`));
    process.exit(1);
  }
});

// Load Stardew Valley data files
const crops = yamljs.load(CROPS_PATH);
const objectInformation = yamljs.load(OBJECT_INFORMATION_PATH);

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
   * Crop's name
   * @type {string}
   */
  crop.name = cropInfoData[0];

  /**
   * Crop's Stardew Valley Wiki URL
   * @type {string}
   */
  crop.url = `http://stardewvalleywiki.com/${crop.name.replace(/ /g, '_')}`;

  /**
   * Crop's image file name
   * @type {string}
   */
  crop.img = `${crop.name.toLowerCase().replace(/ /g, '')}.png`;

  crop.seeds = {
    pierre: 0,
    joja: 0,
    special: 0,
    specialLoc: '',
    specialUrl: '',
  };

  /**
   * Seed's ID
   * @type {number}
   */
  const seedID = Number(key);

  /**
   * Seed's sell value
   * @type {number}
   */
  const seedSellPrice = Number(seedInfoData[1]);

  // Seeds sold at Pierre's General Store
  if (GENERAL_STORE_STOCK_IDS.indexOf(seedID) > -1) {
    crop.seeds.pierre = seedSellPrice * 2;

    // Correct Sunflower Seeds price
    if (seedID === 431) crop.seeds.pierre = 200;
  }

  // Seeds sold at JojaMart
  if (JOJAMART_STOCK_IDS.indexOf(seedID) > -1) {
    crop.seeds.joja = Math.floor(seedSellPrice * 2.5);

    // Correct Sunflower Seeds price
    if (seedID === 431) crop.seeds.joja = 125;
  }

  // Seeds sold at the Traveling Cart
  // if (NOT_SOLD_AT_TRAVELING_CART_IDS.indexOf(seedID) === -1 && seedSellPrice > 0) {
  //   crop.seeds.travelingCart = {
  //     minPrice: Math.max(1 * 100, seedSellPrice * 3),
  //     maxPrice: Math.max(10 * 100, seedSellPrice * 5),
  //   };
  // }

  // Seeds sold at Oasis (Desert shop)
  if (OASIS_STOCK_IDS.indexOf(seedID) > -1) {
    crop.seeds.special = seedSellPrice * 2;
    crop.seeds.specialLoc = 'Oasis';
    crop.seeds.specialUrl = 'http://stardewvalleywiki.com/Oasis';
  // Seeds sold at the Egg Festival (Strawberry Seeds)
  } else if (seedID === 745) {
    crop.seeds.special = 100;
    crop.seeds.specialLoc = 'Egg Festival';
    crop.seeds.specialUrl = 'http://stardewvalleywiki.com/Egg_Festival';
  // Rare Seed (grows Sweet Gem Berry)
  } else if (seedID === 347) {
    crop.seeds.special = 1000;
    crop.seeds.specialLoc = 'Travelling Cart';
    crop.seeds.specialUrl = 'http://stardewvalleywiki.com/Travelling_Cart';
  // Coffee Bean
  } else if (seedID === 433) {
    crop.seeds.special = 2500;
    crop.seeds.specialLoc = 'Travelling Cart';
    crop.seeds.specialUrl = 'http://stardewvalleywiki.com/Travelling_Cart';
  // Ancient Fruit
  } else if (seedID === 499) {
    crop.seeds.special = 450;
    crop.seeds.specialLoc = 'Travelling Cart';
    crop.seeds.specialUrl = 'http://stardewvalleywiki.com/Travelling_Cart';
  }

  /**
   * Crop's description
   * @type {string}
   */
  // crop.description = cropInfoData[5];

  /**
   * Crop's ID and key in ObjectInformation.content and index in springobjects.png tilesheet
   * @type {number}
   */
  // crop.id = Number(cropData[3]);

  /**
   * Crop's category in player's inventory
   * @type {string}
   */
  const cropCategory = cropInfoData[3];

  if (cropCategory === 'Basic -81') return;
  if (crop.name === 'Spice Berry') return;

  /**
   * Crop's sell value
   * @type {number}
   */
  // crop.sellPrice = Number(cropInfoData[1]);

  /**
   * Amount of health restored on consumption
   * Amount of energy restored on consumption is this * 2.5
   * Negative values cause energy loss but not health loss
   * For non-consumable crops this value will be -300
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  // crop.edibility = Number(cropInfoData[2]);

  /**
   * Crop's index in crops.png tilesheet
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  // crop.rowInSpriteSheet = Number(cropData[2]);

  /**
   * Seasons crop can grow in
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {string[]}
   */
  // crop.seasonsToGrowIn = cropData[1].split(' ');

  crop.growth = {};

  crop.growth.initial = cropData[0].split(' ').map(Number).reduce((sum, value) => sum + value);

  /**
   * Each item represents days spent in each stage of growth
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number[]}
   */
  // crop.phaseDays = cropData[0].split(' ').map(Number);

  /**
   * Days taken after first harvest for crop to produce again. If crop doesn't produce again this
   * will be -1
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  crop.growth.regrow = Number(cropData[4]) === -1 ? 0 : Number(cropData[4]);

  crop.produce = {};

  crop.produce.extra = 0;

  crop.produce.extraPerc = 0;

  if (cropHarvestData.length === 4) {
    /**
     * Minimum yield from each harvest
     * @type {number}
     */
    const minHarvest = cropHarvestData[0];

    /**
     * Maximum yield from each harvest
     * @type {number}
     */
    const maxHarvest = cropHarvestData[1];

    /**
     * Field purpose not entirely known. Named after decompiled Crop.cs from Stardew Valley.exe
     * @type {number}
     */
    // crop.harvest.maxHarvestIncreasePerFarmingLevel = cropHarvestData[2];

    /**
     * Field purpose not entirely known. Named after decompiled Crop.cs from Stardew Valley.exe
     * @type {number}
     */
    // crop.harvest.chanceForExtraCrops = cropHarvestData[3];

    if (minHarvest > 1) {
      crop.produce.extra = minHarvest - 1;
      crop.produce.extraPerc = 1;
    } else {
      crop.produce.extra = 1;
      crop.produce.extraPerc = cropHarvestData[3];
    }
  }

  crop.produce.rawN = Number(cropInfoData[1]);

  crop.produce.rawS = Math.floor(crop.produce.rawN * 1.25);

  crop.produce.rawG = Math.floor(crop.produce.rawN * 1.5);

  crop.produce.jar = 0;

  crop.produce.keg = 0;

  crop.produce.jarType = '';

  crop.produce.kegType = '';

  // Vegetables
  if (cropCategory === 'Basic -75') {
    crop.produce.jar = (crop.produce.rawN * 2) + 50;
    crop.produce.keg = Math.floor(crop.produce.rawN * 2.25);
    crop.produce.jarType = 'Pickles';
    crop.produce.kegType = 'Juice';
  // Fruits
  } else if (cropCategory === 'Basic -79') {
    crop.produce.jar = (crop.produce.rawN * 2) + 50;
    crop.produce.keg = crop.produce.rawN * 3;
    crop.produce.jarType = 'Jelly';
    crop.produce.kegType = 'Wine';
  }

  if (crop.name === 'Hops') {
    crop.produce.keg = 300;
    crop.produce.kegType = 'Pale Ale';
  } else if (crop.name === 'Wheat') {
    crop.produce.keg = 200;
    crop.produce.kegType = 'Beer';
  } else if (crop.name === 'Coffee Bean') {
    crop.produce.keg = 30;
    crop.produce.kegType = 'Coffee';
  }

  /**
   * Is the crop harvested with the scythe
   * @type {boolean}
   */
  // crop.scythe = Boolean(Number(cropData[5]));

  /**
   * Does the crop grow on a trellis. May technically be whether the crop has a solid bounding box
   * @type {boolean}
   */
  // crop.trellis = (cropData[7] === 'true');

  /**
   * Whether the crop can become giant
   * @type {boolean}
   */
  // crop.canBeGiant = (GIANT_CROP_IDS.indexOf(crop.id) > -1);

  // crop.seed = {};

  /**
   * Seed's name
   * @type {string}
   */
  // crop.seed.name = seedInfoData[0];

  /**
   * Seed's description
   * @type {string}
   */
  // crop.seed.description = seedInfoData[5];

  /**
   * Seed's category. In Stardew Valley v1.11 this is always 'Seeds -74'
   * @type {string}
   */
  // crop.seed.category = seedInfoData[3];

  /**
   * Would be the amount of health restored on consumption
   * However no seeds are consumable so will always be -300
   * Named after decompiled Crop.cs from Stardew Valley.exe
   * @type {number}
   */
  // crop.seed.edibility = Number(seedInfoData[2]);

  /**
   * Crop's flower colors
   * @type {{red: number, green: number, blue: number}}
   */
  // crop.flowerColors = (() => {
  //   const colors = [];
  //   for (let i = 0; i < cropFlowerColorData.length / 3; i += 1) {
  //     const j = i * 3;
  //     colors.push({
  //       red: cropFlowerColorData[j],
  //       green: cropFlowerColorData[j + 1],
  //       blue: cropFlowerColorData[j + 2],
  //     });
  //   }
  //   return colors;
  // })();

  output[crop.img.replace(/\.png$/, '')] = crop;
});

jsonfile.writeFileSync(OUTPUT_PATH, output, { spaces: 2 });
console.log(`🌱  Parsed ${Object.keys(output).length} crops and saved to ${OUTPUT_PATH}`);

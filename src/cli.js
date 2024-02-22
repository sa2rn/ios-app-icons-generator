#!/usr/bin/env node
import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import prompts from 'prompts';
import minimist from 'minimist';
import IconGenerator from './icon-generator';

try {
  const outputDir = path.join(process.cwd(), 'Assets.xcassets');
  const assets = await fs.readdir(outputDir);

  const { asset } = await prompts({
    type: 'select',
    name: 'asset',
    message: 'Select assets',
    choices: assets.map((item) => ({ title: item, value: item })),
  });

  const argv = minimist(process.argv.slice(2));
  const originalIconPath = path.resolve(process.cwd(), argv._[0]);
  const generator = new IconGenerator(originalIconPath, path.join(outputDir, asset));
  await generator.generate();
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Assets.xcassets not found');
  } else {
    throw error;
  }
}

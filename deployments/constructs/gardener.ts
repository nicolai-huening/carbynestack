/*
 * Copyright (c) 2023 - for information on the respective copyright owner
 * see the NOTICE file and/or the repository https://github.com/carbynestack/carbynestack.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Construct } from "constructs"
import * as helm from "@cdktf/provider-helm";
import * as cdktf from "cdktf";
import * as path from "path"

export interface GardenerProviderConfig {
  name: string,
  imageType: string,
  workerZones: string[],
  purpose: string,
  floatinPoolSuffix?: string,
  region: string
}

export interface GardenerConfig {
  idPostfix?: string;
  dependsOn: cdktf.ITerraformDependable[];
  helmProvider: cdktf.TerraformProvider;
  provider: GardenerProviderConfig;
  secretName: string;
  namespace: string;
}

export class Gardener extends Construct {
  constructor(scope: Construct, name: string, config: GardenerConfig) {
    super(scope, name);

    const gardenerChart = new cdktf.TerraformAsset(
    this,
    "gardener-chart-path",
      {
        path: path.resolve(__dirname, "../charts/gardener"),
        type: cdktf.AssetType.DIRECTORY,
      },
    );

    new helm.release.Release(
      this,
      `gardener-shoot${config.idPostfix}`,
      {
        dependsOn: [...config.dependsOn],
        wait: true,
        waitForJobs: true,
        provider: config.helmProvider,
        name: name,
        chart: `./${gardenerChart.path}`,
        namespace: config.namespace,
        set: [
          {name: "clustername", value: `cs-party-${config.idPostfix}`},
          {name: "namespace", value: config.namespace},
          {name: "secretName", value: config.secretName}
        ],
      });
  }
}

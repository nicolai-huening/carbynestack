/*
 * Copyright (c) 2023 - for information on the respective copyright owner
 * see the NOTICE file and/or the repository https://github.com/carbynestack/carbynestack.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Construct } from "constructs";
import * as helm from "@cdktf/provider-helm";
import * as cdktf from "cdktf";
import { Gardener } from "../constructs/gardener";
import { TerraformVariable } from "cdktf";

export default class GardenerStack extends cdktf.TerraformStack {
  constructor(scope: Construct, id: string, kubeconfigPath: string = "~/.kube/config") {
    super(scope, id);

    const gardenerContext = new TerraformVariable(this, "gardenerC8Context",{
      type: "string",
      nullable: false,
      description: "The gardener kubernetes context where the shoots will be deployed.",
    });


    const gardenerNamespace = new TerraformVariable(this, "gardenerNamespace",{
      type: "string",
      nullable: false,
      description: "The gardener kubernetes context where the shoots will be deployed.",
    });

    const helmProvider = new helm.provider.HelmProvider(
      this,
      `provider-helm-shoot`,
      {
        alias: `provider-helm-shoot`,
        kubernetes: {
          configPath: kubeconfigPath,
          configContext: gardenerContext.value
        },
      },
    );
    
    for (let i = 1; i <= 2; i++) {
      new Gardener(this, `cs-party-${i}`,
        {
          dependsOn: [],
          idPostfix: `${i}`,
          helmProvider: helmProvider,
          secretName: "my-aws-gardener-secret-2023",
          namespace: gardenerNamespace.value,
          provider: {
            name: "aws",
            imageType: "c5.2xlarge",
            workerZones: ["eu-west-1b"],
            purpose: "evaluation",
            region: "eu-west-1"
          }
        }
      );
    }
  }
}

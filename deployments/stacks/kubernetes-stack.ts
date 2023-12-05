/*
 * Copyright (c) 2023 - for information on the respective copyright owner
 * see the NOTICE file and/or the repository https://github.com/carbynestack/carbynestack.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as kubernetes from "@cdktf/provider-kubernetes";
import * as kubectl from "../.gen/providers/kubectl";
import { Construct } from "constructs";
import * as helm from "@cdktf/provider-helm";
import * as http from "@cdktf/provider-http";
import * as cdktf from "cdktf";
import { CarbyneStack } from "../constructs/carbyne-stack";
import { VCP } from "../constructs/vcp";
import { DnsProvider } from "../.gen/providers/dns/provider";

export default class KubernetesStack extends cdktf.TerraformStack {
  constructor(scope: Construct, id: string, kubeconfigPath: string = "~/.kube/config") {
    super(scope, id);
    const dependables: cdktf.ITerraformDependable[] = [];
    const ingressIps: string[] = [];

    // First create clusters with ingress to get the public ips.
    new DnsProvider(this, "dns-provider", {
    });

    for (let i = 1; i <= 2; i++) {
      const kubernetesProvider = new kubernetes.provider.KubernetesProvider(
        this,
        `provider-kubernetes-${i}`,
        {
          alias: `provider-kubernetes-${i}`,
          configPath: kubeconfigPath,
          configContext: `cs-party-${i}`
        },
      );

      const kubectlProvider = new kubectl.provider.KubectlProvider(
        this,
        `provider-kubectl-${i}`,
        {
          alias: `provider-kubectl-${i}`,
          configPath: kubeconfigPath,
          configContext: `cs-party-${i}`
        },
      );

      const helmProvider = new helm.provider.HelmProvider(
        this,
        `provider-helm-${i}`,
        {
          alias: `provider-helm-${i}`,
          kubernetes: {
            configPath: kubeconfigPath,
            configContext: `cs-party-${i}`
          },
        },
      );


      const httpProvider = new http.provider.HttpProvider(
        this,
        `provider-http-${i}`,
        {
          alias: `provider-http-${i}`,
        },
      );

      const vcp = new VCP(this, `vcp-${i}`, {
        kubernetesProvider,
        kubectlProvider,
        helmProvider,
        httpProvider,
      },false);

      dependables.push(
        ...[
          vcp.knative.knativeOperator,
          vcp.knative.knativeServing,
          vcp.postgres,
          vcp.istio.istioIngressGatewayService,
        ],
      );
      ingressIps.push(
        vcp.istio.ingressIP
      );
    }
    for (let i = 0; i < 2; ++i) {
      const helmProvider = new helm.provider.HelmProvider(
        this,
        `setup-provider-helm-${i+1}`,
        {
          alias: `setup-provider-helm-${i+1}`,
          kubernetes: {
            configPath: kubeconfigPath,
            configContext: `cs-party-${i+1}`
          },
        },
      );
      // eslint-disable-next-line no-new
      new CarbyneStack(this, `cs-${i+1}`, {
        dependsOn: dependables,
        helmProvider,
        fqdn: ingressIps[i],
        isMaster: i === 0,
        masterHost: `${ingressIps[0]}.sslip.io`,
        macKey:
          i === 0
            ? "-88222337191559387830816715872691188861"
            : "1113507028231509545156335486838233835",
        noSSLValidation: true,
        partnerFQDN: `${ingressIps[1-i]}.sslip.io`,
        prime: "198766463529478683931867765928436695041",
        r: "141515903391459779531506841503331516415",
        rInv: "133854242216446749056083838363708373830",
        gfpMacKey:
          i === 0
            ? "-88222337191559387830816715872691188861"
            : "1113507028231509545156335486838233835",
        gf2nMacKey: i === 0 ? "0xb660b323e6" : "0x4ec9a0343c",
        gf2nBitLength: 40,
        gf2nStorageSize: 8,
      });
    }
  }
}

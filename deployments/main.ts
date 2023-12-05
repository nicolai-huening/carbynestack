/*
 * Copyright (c) 2023 - for information on the respective copyright owner
 * see the NOTICE file and/or the repository https://github.com/carbynestack/carbynestack.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as cdktf from "cdktf";
import LocalKindStack from "./stacks/local-kind-stack";
import KubernetesStack from "./stacks/kubernetes-stack";
import GardenerStack from "./stacks/gardener-stack";
const app = new cdktf.App();

// Local stack using KinD (Kubernetes in Docker)
// eslint-disable-next-line no-new
new LocalKindStack(app, "local-kind");
new KubernetesStack(app, "kubernetes");
new GardenerStack(app, "gardener");
app.synth();

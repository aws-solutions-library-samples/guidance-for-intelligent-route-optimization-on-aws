// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  IoTClient,
  CreateKeysAndCertificateCommand,
} from "@aws-sdk/client-iot";
import {
  SecretsManagerClient,
  CreateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "locationworkshop";

const iot = new IoTClient({});
const secretsManager = new SecretsManagerClient({});

(async () => {
  const { certificateId, certificatePem, keyPair } = await iot.send(
    new CreateKeysAndCertificateCommand({
      setAsActive: true,
    })
  );

  if (!certificateId || !certificatePem || !keyPair) {
    throw new Error("Failed to create keys and certificate");
  }
  console.log(`Created Certificate with id ${certificateId}`);

  await secretsManager.send(
    new CreateSecretCommand({
      Name: SECRET_NAME,
      SecretString: JSON.stringify({
        cert: certificatePem,
        keyPair: keyPair.PrivateKey,
      }),
    })
  );
  console.log(`Certificate stored in secret ${SECRET_NAME}`);
})();

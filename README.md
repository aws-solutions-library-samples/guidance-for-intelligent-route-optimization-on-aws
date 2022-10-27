# Intelligent Route Optimization and Tracking using Amazon Location Services and AWS Amplify

## Overview

This solution provides a reference implementation for route optimization and tracking that can be leveraged by organizations that serve their own customers “in the field.” There are two broad categories of these organizations: 1) Organizations that incorporate a field service business function, e.g., the repair of equipment that they sell to their end customers and 2) Organizations that incorporate a route sales business function, e.g., a CPG company’s own or contract employees stocking the shelves of a retailer with the CPG company’s products (called direct-to-store delivery or DSD).

## Solution Design

This AWS reference solution is divided into 3 components - Route Entry, Route Calculation and Route Tracking:

1. Route entry - The Route entry component leverages Amplify low code React development with AWS AppSync and Amazon DynamoDB to enable a field service dispatcher to enter and store destination and waypoint locations from a map.
2. Route calculation - The Route calculation component leverages AWS Lambda, Location Services matrix routing and AppSync to automatically create an optimized lowest cost route based on the shortest time to complete the trip and then displays the optimized route on the map.
3. Route tracking - The Route tracking component integrates the Amplify based React application with AWS App Sync, AWS IOT Core and Location Services Tracker to track our driver on the map as they complete their route. This component simulates an IOT sensor/device installed in the driver's vehicle.

![](images/arch-diagram.PNG)

## Prerequisites

The frontend application for this solution was bootstrapped with [Vite](https://vitejs.dev) and [Amplify CLI](http://docs.aws.amazon.com/amplify/latest/userguide/cli.html).

You will need to have a valid AWS Account in order to deploy these resources. These resources may incur costs to your AWS Account. The cost from most services are covered by the [AWS Free Tier](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all) but not all of them. If you don't have an AWS Account follow [these instructions to create one](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).

We highly recommend an [AWS Cloud9](https://aws.amazon.com/cloud9/) environment to run and deploy this solution. However Cloud9 is not required and you can use any development environment of your choice. [Follow the steps here to set up your AWS Cloud9 environment](https://docs.aws.amazon.com/cloud9/latest/user-guide/create-environment-main.html)

After cloning this repo you can setup the project so long the following prerequisites are installed:

1. **AWS CLI**
   - Follow these steps to [install the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
   - Configure the AWS CLI using [Quick configuration with aws configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)
   - _Skip these steps if you are using AWS Cloud9_
2. **Node.js version >= 14.x**
   - Verify that your Node.js version >=14.x. Download [latest version here](https://nodejs.org/en/download/)
3. **Npm version >= 8.x**
   - Verify that your npm version >=8.x. Verify and download [latest version here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
4. **Amplify CLI `npm i -g @aws-amplify/cli` (v8.0.2 or higher)**
   - [Install and configure the Amplify CLI](https://docs.amplify.aws/cli/start/install/).

## Setup

### **OPTION 1(Recommended)**: Self-Paced Workshop: Build Your Own Solution

If you want to create your own backend and learn more about the solution, we recommend you follow [this self-paced workshop](https://catalog.workshops.aws/amazon-location-service-for-intelligent-supply-chain/en-US).

The workshop takes about 2 hours to complete depending on your pace and profile, however you'll get the chance to experience the same workshop that will be delivered at re:Invent 2022.

### **OPTION 2**: Deploy the Solution As-Is

If instead you want to check out the solution, follow these steps and get the solution up and running in 15 minutes.

#### Install all dependencies

While in the root of the project directory, run the following command to install all the dependencies:

```sh
npm install
```

#### Initialize Amplify App

While still in the root of the project directory, run the following command to configure the backend:

```sh
amplify init
```

After that, the CLI might ask you a few questions about authentication and environment:

```
? Enter a name for the environment dev
? Choose your default editor: Visual Studio Code
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify app: dvjps0x5nx9x3

Deployment completed.
Deployed root stack locationworkshop [ ======================================== ] 4/4
        amplify-locationworkshop-dev-… AWS::CloudFormation::Stack     CREATE_COMPLETE                Thu Oct 27 2022 18:01:20…
        DeploymentBucket               AWS::S3::Bucket                CREATE_COMPLETE                Thu Oct 27 2022 18:01:12…
        UnauthRole                     AWS::IAM::Role                 CREATE_COMPLETE                Thu Oct 27 2022 18:01:18…
        AuthRole                       AWS::IAM::Role                 CREATE_COMPLETE                Thu Oct 27 2022 18:01:18…

Deployment bucket fetched.

# Additional logs were removed for brevity
```

#### Create AWS IoT Core Certificate

Once the Amplify app has been initialized, and before deploying all the resources, there're a few manual steps needed that involve creating an IoT Core Certificate.

To ease the operation, we have prepared a script that creates the certificate and stores it in AWS Secrets Manager, to run it execute the following command in the terminal:

```sh
npm run utils:createIoTCert
```

After a few moments you should see an output similar to the one below:

```sh
> aws-intelligent-route-optimization-tracking@0.5.0 utils:createIoTCert
> node scripts/create-cert.mjs

Created Certificate with id b6f4148bf620a4526dd554895f4348629a416f18927ceac3220a5691e6614040
Certificate stored in secret locationworkshop
```

Take note of the certificate id logged as you will need it in the next step.

#### Update CDK Stack for IoT Resources

Take the value of the certificate id from the previous step and update the `certificateId` value in the `iotResources` section of the project found in the `amplify/backend/custom/iotResources/cdk-stack.ts` file:

_Before_

```ts
// Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
const CERTIFICATE_ID = "[YOUR_CERTIFICATE_ID]";
```

_After_

```ts
// Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
const CERTIFICATE_ID =
  "b6f4148bf620a4526dd554895f4348629a416f18927ceac3220a5691e6614040"; // Your ID will be different
```

#### Update AWS IoT Core Endpoint

Finally, before deploying the resources, run one last command to find out the URL of the IoT Core endpoint for the region and account you are using:

```sh
aws iot describe-endpoint --endpoint-type iot:Data-ATS
{
    "endpointAddress": "[some-id]-ats.iot.[region-name].amazonaws.com"
}
```

Copy the endpoint address, and then paste it in the `amplify/backend/function/deviceSimulatorFn/src/index.js` file:

_Before_

```js
const THING_ENDPOINT = "[some-id]-ats.iot.[region-name].amazonaws.com";
```

_After_

```js
const THING_ENDPOINT = "a2o73yi2sirhon-ats.iot.eu-central-1.amazonaws.com"; // Your endpoint will be different
```

#### Deploy backend

Finally deploy the backend to the cloud:

```sh
amplify push
```

Before continuing the CLI will ask you to input some values for environment variables of the Lambda functions, use the values below to answer:

```sh
Some Lambda function environment variables are missing values in this Amplify environment.
✔ Enter the missing environment variable value of ROUTE_CALCULATOR_NAME in routeOptimizerFn: · routecalculator_location_workshop
✔ Enter the missing environment variable value of ROUTE_CALCULATOR_NAME in deviceSimulatorFn: · routecalculator_location_workshop
✔ Enter the missing environment variable value of TRACKER_NAME in iotUpdateTrackerFn: · tracker_location_workshop
✔ Enter the missing environment variable value of TRACKER_NAME in getDevicePositionFn: · tracker_location_workshop

⠏ Fetching updates to backend environment: dev from the cloud.✅ GraphQL schema compiled successfully.

Edit your schema at /home/ec2-user/environment/amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at /home/ec2-user/environment/amplify/backend/api/awssupplychaindemo/schema

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
✔ Successfully pulled backend environment dev from the cloud.
⠙ Building resource api/awssupplychaindemo GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema

    Current Environment: dev

┌──────────┬──────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name            │ Operation │ Provider plugin   │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Auth     │ locationworkshop44c90446 │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Geo      │ workshopMap              │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Geo      │ workshopPlaces           │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Custom   │ locationResources        │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Custom   │ iotResources             │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Api      │ locationworkshop         │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ routeOptimizerFn         │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ deviceSimulatorFn        │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ iotUpdateTrackerFn       │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ startItineraryFn         │ Create    │ awscloudformation │
├──────────┼──────────────────────────┼───────────┼───────────────────┤
│ Function │ getDevicePositionFn      │ Create    │ awscloudformation │
└──────────┴──────────────────────────┴───────────┴───────────────────┘
? Are you sure you want to continue? Yes
 GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
⠹ Building resource api/awssupplychaindemo GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
```

At the very last question Amplify CLI will ask you if you want to generate the code for the API. Answer **no**, since this sample already provides queries, mutations, and subscriptions.

```sh
? Do you want to generate code for your newly created GraphQL API No

# Additional logs were removed for brevity
```

As last step before running the application, you need to run one last command that we need to run in order to allow IoT Core to invoke the Lambda function that processes the IoT Core events:

```sh
aws lambda add-permission --function-name iotUpdateTrackerFn-dev --statement-id iot-events --action "lambda:InvokeFunction" --principal iot.amazonaws.com
```

When the backend is deployed, you can start the frontend application. Go to the [Run the app locally](#run-the-app-locally) section to learn how to run the frontend application locally.

### Run the app locally

After having deployed the backend using one of the two methods above, run the following command to start the app:

```sh
npm start
```

Then using your browser go to to http://localhost:8080 and create an account.

## Clean up

```sh
amplify delete
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

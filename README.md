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
This solution was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Amplify CLI](http://docs.aws.amazon.com/amplify/latest/userguide/cli.html).

You will need to have a valid AWS Account in order to deploy these resources. These resources may incur costs to your AWS Account. The cost from most services are covered by the [AWS Free Tier](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all) but not all of them. If you don't have an AWS Account follow [these instructions to create one](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).

We highly recommend an [AWS Cloud9](https://aws.amazon.com/cloud9/) environment to run and deploy this solution. However Cloud9 is not required and you can use any development environment of your choice. [Follow the steps here to set up your AWS Cloud9 environment](https://docs.aws.amazon.com/cloud9/latest/user-guide/create-environment-main.html)

After cloning this repo you can setup the project so long the following prerequisites are installed:

1. AWS CLI
  - Follow these steps to [install the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). 
  - Configure the AWS CLI using [Quick configuration with aws configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)
  - *Skip these steps if you are using AWS Cloud9*
2. Node.js version >= 14.x
  - Verify that your Node.js version >=14.x. Download [latest version here](https://nodejs.org/en/download/)
3. Npm version >= 8.x
  - Verify that your npm version >=8.x. Verify and download [latest version here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
4. Amplify CLI `npm i -g @aws-amplify/cli` (v8.0.2 or higher)
  - [Install and configure the Amplify CLI](https://docs.amplify.aws/cli/start/install/). Our solution requires v8.0.2 or higher of the Amplify CLI


## Setup


### Install all dependencies

While in the root of the project directory, run the following command to install all the dependencies:

```sh
npm install
```

### **Option 1(Recommended)**: CREATE YOUR OWN AMPLIFY BACKEND

> **Note**
> If you clone this repository _as-is_ and decide to create your own backend, delete or rename the `amplify` directory that contains the Amplify CLI generated files and folders before starting to follow the steps below.

#### Step 1: Create a new Amplify project

While in the root directory of the cloned project, run the following command to create a new Amplify backend:

```sh
amplify init
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the project awssupplychaindemo
The following configuration will be applied:

Project information
| Name: awssupplychaindemo
| Environment: dev
| Default editor: Visual Studio Code
| App type: javascript
| Javascript framework: react
| Source Directory Path: src
| Distribution Directory Path: build
| Build Command: npm run-script build
| Start Command: npm run-script start

? Initialize the project with the above configuration? Yes
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify app: d2mrv0blz6ulx8
⠙ Initializing project in the cloud...

# Additional logs were removed for brevity
```

Then start adding resources to the backend.

#### Step 2: Create Amazon Location Service resources

While in the root of the project run the following command:

```sh
amplify add geo
? Select which capability you want to add: Map (visualize the geospatial data)
✔ geo category resources require auth (Amazon Cognito). Do you want to add auth now? (Y/n) · yes
Using service: Cognito, provided by: awscloudformation

 The current configured provider is Amazon Cognito.

 Do you want to use the default authentication and security configuration? Default configuration
 Warning: you will not be able to edit these selections.
 How do you want users to be able to sign in? Email
 Do you want to configure advanced settings? No, I am done.
✅ Successfully added auth resource awssupplychaindemoc6a313aa locally

✅ Some next steps:
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud

✔ Provide a name for the Map: · supplychainmap
✔ Who can access this Map? · Authorized users only
Available advanced settings:
- Map style & Map data provider (default: Streets provided by Esri)

✔ Do you want to configure advanced settings? (y/N) · yes
✔ Specify the map style. Refer https://docs.aws.amazon.com/location-maps/latest/APIReference/API_MapConfiguration.html · Explore (data provided by HERE)
✅ Successfully added resource supplychainmap locally.
```

Then add a Place Index resource:

```sh
amplify add geo
? Select which capability you want to add: Location search (search by places, addresses, coordinates)
✔ Provide a name for the location search index (place index): · supplychainplace
✔ Who can access this search index? · Authorized users only
Available advanced settings:
- Search data provider (default: HERE)
- Search result storage location (default: no result storage)

✔ Do you want to configure advanced settings? (y/N) · yes
✔ Specify the data provider of geospatial data for this search index: · HERE
✔ Do you want to cache or store the results of search operations? Refer https://docs.aws.amazon.com/location-places/latest/APIReference/API_DataSourceConfiguration.html (y/N) · yes

✅ Successfully added resource supplychainplace locally.
```

Next, add an Amplify Custom Resource. This is needed because at the moment Amplify CLI doesn't support creating Route Calculator and Tracker resources yet:

```sh
amplify add custom
✔ How do you want to define this custom resource? · AWS CDK
✔ Provide a name for your custom resource · customLocation
✅ Created skeleton CDK stack in amplify/backend/custom/customLocation directory
```

Before starting to defining resources in the CDK stack you need to add a new dependency to the stack, open the `amplify/backend/custom/customResourceXXXXX/package.json` file in your text editor and replace its content with this:

```json
{
  "name": "custom-resource",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@aws-amplify/cli-extensibility-helper": "^2.0.0",
    "@aws-cdk/core": "~1.156.1",
    "@aws-cdk/aws-iam": "~1.156.1",
    "@aws-cdk/aws-location": "~1.156.1"
  },
  "devDependencies": {
    "typescript": "^4.2.4"
  }
}
```

Then, while in the `amplify/backend/custom/customLocation` directory, run `npm i` in your terminal to install the dependencies.

Open the `amplify/backend/custom/customLocation/cdk-stack.ts` file and add the code that you can find in the [`amplify/backend/custom/customLocation/cdk-stack.ts`](amplify/backend/custom/customLocation/cdk-stack.ts) file of this repo.

Next, you need to allow the authenticated IAM role to access the Route Calculator resource. This will allow logged-in users to call the `geo:CalculateRoute` API.

To do so we need to extend the Amplify generated IAM role by running:

```sh
amplify override project
✅ Successfully generated "override.ts" folder at amplify/backend/awscloudformation
✔ Do you want to edit override.ts file now? (Y/n) · no
```

And then add the following statement to the `override.ts` file that was generated (`amplify/backend/awscloudformation/override.ts`):

```ts
import { AmplifyRootStackTemplate } from "@aws-amplify/cli-extensibility-helper";

export function override(resources: AmplifyRootStackTemplate) {
  const authRole = resources.authRole;

  const basePolicies = Array.isArray(authRole.policies)
    ? authRole.policies
    : [authRole.policies];

  authRole.policies = [
    ...basePolicies,
    {
      policyName: "amplify-permissions-custom-resources",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Resource:
              "arn:aws:geo:[region-name]:[account-id]:route-calculator/routecalculator_supplychain",
            Action: ["geo:CalculateRoute*"],
            Effect: "Allow",
          },
        ],
      },
    },
  ];
}
```

**Note**: Make sure to update the arn to include the AWS Region and [Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html) of your Amplify project.

#### Step 3: Initialize the AppSync GraphQL API

Continue by adding an AppSync API:

```sh
amplify add api
? Select from one of the below mentioned services: GraphQL
? Here is the GraphQL API that we will create. Select a setting to edit or continue Authorization modes: API key (default, expiration time: 7 days from now)
? Choose the default authorization type for the API Amazon Cognito User Pool
Use a Cognito user pool configured as a part of this project.
? Configure additional auth types? No
? Here is the GraphQL API that we will create. Select a setting to edit or continue Continue
? Choose a schema template: Blank Schema
✅ GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
✔ Do you want to edit the schema now? (Y/n) · no
Edit the file in your editor: amplify/backend/api/awssupplychaindemo/schema.graphql
✅ Successfully added resource awssupplychaindemo locally
```

Before deploying the resources, open the file `amplify/backend/api/awssupplychaindemo/schema.graphql` and replace its content with the following schema:

```graphql
type Coords {
  lng: Float!
  lat: Float!
}

type Marker {
  point: Coords!
  label: String
}

type Itinerary
  @model
  @auth(rules: [{ allow: owner, operations: [create, read, update, delete] }]) {
  id: ID!
  label: String!
  points: [Marker]!
  date: AWSDate!
  optimized: Boolean! @default(value: "false")
  hasStarted: Boolean! @default(value: "false")
  type: String!
    @index(
      name: "itinerariesByDate"
      queryField: "itinerariesByDate"
      sortKeyFields: ["date"]
    )
    @default(value: "itinerary")
}
```

**Tip:** consider keeping the schema file open in your editor as we will be adding more types to it later.

#### Step 4: Create the AWS Lambda to simulate a device movement

As a next step, before starting to create some Lambda functions, we will create a Lambda Layer that will be shared by the functions.

```sh
amplify add function
? Select which capability you want to add: Lambda layer (shared code & resource used across functions)
? Provide a name for your Lambda layer: powertools
? Choose the runtime that you want to use: NodeJS
? The current AWS account will always have access to this layer.
Optionally, configure who else can access this layer. (Hit <Enter> to skip)
✅ Lambda layer folders & files created:
amplify/backend/function/awssupplychaindemopowertools

Next steps:
Move your libraries to the following folder:
[NodeJS]: amplify/backend/function/awssupplychaindemopowertools/lib/nodejs

# Additional logs were removed for brevity
```

Next, open the `amplify/backend/function/awssupplychaindemopowertools/lib/nodejs` folder that was added to your project and run `npm i @aws-lambda-powertools/logger@latest` to install the [AWS Lambda Powertools Logger](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/core/logger/) that we will be using to create structured logs for our Lambda functions.

Having JSON structured log entries helps not only in searching, but also produces consistent logs containing enough context and data to ask arbitrary questions on the status of your system. We can take advantage of the logger from [AWS Lambda Powertools for TypeScript](https://github.com/awslabs/aws-lambda-powertools-typescript).

Then create a file at `amplify/backend/function/awssupplychaindemopowertools/opt/powertools.js` and add the following code:

```js
const { Logger } = require("@aws-lambda-powertools/logger");

const awsLambdaPowertoolsVersion = "0.11.1-rc.0";

const logger = new Logger({
  persistentLogAttributes: {
    logger: {
      name: "@aws-lambda-powertools/logger",
      version: awsLambdaPowertoolsVersion,
    },
  },
  logLevel: "DEBUG",
});

module.exports = {
  logger,
};
```

Next, create the first Lambda function that will be used to simulate a truck driving around the map:

```sh
amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: deviceSimulatorFn
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration
- Environment variables configuration
- Secret values configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? Yes
? Select the categories you want this function to have access to. storage
? Select the operations you want to permit on Itinerary:@model(appsync) read

You can access the following resource attributes as environment variables from your Lambda function
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        ENV
        REGION
? Do you want to invoke this function on a recurring schedule? No
? Do you want to enable Lambda layers for this function? Yes
? Provide existing layers or select layers in this project to access from this function (pick up to 5): awssupplychaindemopowertools
? Do you want to configure environment variables for this function? Yes
? Enter the environment variable name: ROUTE_CALCULATOR_NAME
? Enter the environment variable value: routecalculator_supplychain
? Select what you want to do with environment variables: Add new environment variable
? Enter the environment variable name: POWERTOOLS_SERVICE_NAME
? Enter the environment variable value: deviceSimulatorFn
? Select what you want to do with environment variables: I'm done

You can access the following resource attributes as environment variables from your Lambda function
        ENV
        REGION
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        ROUTE_CALCULATOR_NAME
? Do you want to configure secret values this function can access? No
? Do you want to edit the local lambda function now? No
Successfully added resource devicesimulatorfn locally.

# Additional logs were removed for brevity
```

Next, continue by navigating to the function's folder (`amplify/backend/function/devicesimulatorfn/src`) with your terminal, and then running the following commands to create the directory structure we need as well as installing some dependencies:

```sh
mkdir certs
touch utils.js
npm i @aws-sdk/client-location @turf/along @turf/helpers aws-iot-device-sdk-v2
```

Then open the `utils.js` file you just created (full path `amplify/backend/function/devicesimulatorfn/src/utils.js`) and add the code that you can find at the following link from [this repository](amplify/backend/function/devicesimulatorfn/src/utils.js).

Finally, open the `index.js` file and add the code you can find this link from [the repository](amplify/backend/function/devicesimulatorfn/src/index.js).

While editing this file, make sure to replace the value of the `THING_ENDPOINT` constant using the AWS IoT Core endpoint that corresponds to your AWS Region and account. You can obtain your endpoint by running the following command:

```sh
aws iot describe-endpoint --endpoint-type iot:Data-ATS
{
    "endpointAddress": "[some-id]-ats.iot.[region-name].amazonaws.com"
}
```

Next, since we want this Lambda function to be running for as long as possible, we will extend the default timeout duration of 25 seconds to 15 minutes. To do so, open the `amplify/backend/function/deviceSimulatorFn/deviceSimulatorFn-cloudformation-template.json` file and find the line that has the `"Timeout": 25` text, and replace it to `"Timeout": 900` (15 minutes).

Finally, before moving forward to the next resource, open the `amplify/backend/function/devicesimulator/custom-policies.json` file and add the following code:

```json
[
  {
    "Action": ["geo:CalculateRoute"],
    "Resource": [
      "arn:aws:geo:[region-name]:[account-id]:route-calculator/routecalculator_supplychain"
    ]
  }
]
```

#### Step 5: Create the IoT Core resources

Next, continue by running the following command to generate a new IoT Core certificate that will be used by the function to connect to the IoT Core endpoint, this is one of the few manual steps that you will need to run as it's easier to manage this kind of resources via the AWS CLI rather than with Amplify:

```sh
aws iot create-keys-and-certificate \
    --set-as-active \
    --certificate-pem-outfile amplify/backend/function/devicesimulatorfn/src/certs/certificate.pem.crt \
    --public-key-outfile amplify/backend/function/devicesimulatorfn/src/certs/public.pem.key \
    --private-key-outfile amplify/backend/function/devicesimulatorfn/src/certs/private.pem.key

{
    "certificateArn": "arn:aws:iot:[region-name]:[account-id]:cert/xxxxx",
    "certificatePem": "-----BEGIN CERTIFICATE-----\nxxxxxxxxxx==\n-----END CERTIFICATE-----\n",
    "keyPair": {
        "PublicKey": "-----BEGIN PUBLIC KEY-----\nxxxxx\n-----END PUBLIC KEY-----\n",
        "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\nxxxxx\n-----END RSA PRIVATE KEY-----\n"
    },
    "certificateId": "[certificate-id]"
}
```

Take the value of the `certificateId` key from the output and update the `certificateId` value in the `iotResources` that we are about to create below.

Once again we can use the `amplify add custom` command to create the IoT resources that we need with CDK:

```sh
amplify add custom
```

Then, just like you did before, open the file at `amplify/backend/custom/iotResources/package.json` and update the dependency list as follows:

```json
{
  "name": "custom-resource",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@aws-amplify/cli-extensibility-helper": "^2.0.0",
    "@aws-cdk/core": "~1.156.0",
    "@aws-cdk/aws-iam": "~1.156.0",
    "@aws-cdk/aws-iot": "~1.156.0",
    "@aws-cdk/aws-iot-actions": "~1.156.0",
    "@aws-cdk/aws-lambda": "~1.156.0"
  },
  "devDependencies": {
    "typescript": "^4.2.4"
  }
}
```

After that, while in the `amplify/backend/custom/iotResources` directory run the `npm i` command to install the dependencies.

Then, open the `amplify/backend/custom/iotResources/cdk-stack.ts` file and update it with the content of the [`iotResources/cdk-stack.ts`](amplify/backend/custom/iotResources/cdk-stack.ts) from this repo.

Before moving on, find the line that looks like this:

```ts
// Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
const CERTIFICATE_ID = "[YOUR_CERTIFICATE_ID]";
```

And replace the value between the quotes with the certificate id that you created earlier.

#### Step 6: Create the remaining Lambda functions

Next, create a new AWS Lambda function to optimize the route:

```sh
amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: routeOptimizerFn
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration
- Environment variables configuration
- Secret values configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? Yes
? Select the categories you want this function to have access to. storage
? Select the operations you want to permit on Itinerary:@model(appsync) read, update

You can access the following resource attributes as environment variables from your Lambda function
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        ENV
        REGION
? Do you want to invoke this function on a recurring schedule? No
? Do you want to enable Lambda layers for this function? No
? Do you want to configure environment variables for this function? Yes
? Enter the environment variable name: ROUTE_CALCULATOR_NAME
? Enter the environment variable value: routecalculator_supplychain
? Select what you want to do with environment variables: Add new environment variable
? Enter the environment variable name: POWERTOOLS_SERVICE_NAME
? Enter the environment variable value: routeOptimizerFn
? Select what you want to do with environment variables: I\'m done

You can access the following resource attributes as environment variables from your Lambda function
        ENV
        REGION
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        ROUTE_CALCULATOR_NAME
        POWERTOOLS_SERVICE_NAME
? Do you want to configure secret values this function can access? No
? Do you want to edit the local lambda function now? No
Successfully added resource routeOptimizerfn locally.

# Additional logs were removed for brevity
```

Next, in the `amplify/backend/function/routeOptimizerFn/src` folder, run the following command with your terminal:

```
npm i @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb @aws-sdk/client-location
```

Next, create a new file called `amplify/backend/function/routeOptimizerFn/src/utils.js` and add the contents of the one you can find in the [`amplify/backend/function/routeOptimizerFn/src/utils.js`](amplify/backend/function/routeOptimizerFn/src/utils.js) of this repo.

Then open the `amplify/backend/function/routeOptimizerFn/src/index.js` file and replace its contents with the ones you can find in the [`amplify/backend/function/routeOptimizerFn/src/index.js`](amplify/backend/function/routeOptimizerFn/src/index.js) of this repo.

Finally, open the `amplify/backend/function/routeOptimizerFn/custom-policies.json` file and replace its contents with the following:

```json
[
  {
    "Action": ["geo:CalculateRouteMatrix"],
    "Resource": [
      "arn:aws:geo:[region-name]:[account-id]:route-calculator/routecalculator_supplychain"
    ]
  }
]
```

**Note**: Make sure to update the arn to include the AWS Region and [Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html) of your Amplify project.

The next step is to create another function that will be in charge of processing the events that are sent to the IoT Core endpoint.

```sh
amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: iotUpdateTrackerFn
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration
- Environment variables configuration
- Secret values configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? No
? Do you want to invoke this function on a recurring schedule? No
? Do you want to enable Lambda layers for this function? Yes
? Provide existing layers or select layers in this project to access from this function (pick up to 5): awssupplychaindemopowertools
? Select a version for awssupplychaindemopowertools: Always choose latest version
? Do you want to configure environment variables for this function? Yes
? Enter the environment variable name: TRACKER_NAME
? Enter the environment variable value: tracker_supplychain
? Select what you want to do with environment variables: Add new environment variable
? Enter the environment variable name: POWERTOOLS_SERVICE_NAME
? Enter the environment variable value: iotUpdateTrackerFn
? Select what you want to do with environment variables: I'm done

You can access the following resource attributes as environment variables from your Lambda function
        ENV
        REGION
        TRACKER_NAME
        POWERTOOLS_SERVICE_NAME
? Do you want to configure secret values this function can access? No
? Do you want to edit the local lambda function now? No
Successfully added resource iotUpdateTracker locally.

# Additional logs were removed for brevity
```

Next, in the `amplify/backend/function/iotUpdateTrackerFn/src` folder, run the following command with your terminal:

```
npm i @aws-sdk/client-location
```

Then open the `amplify/backend/function/iotUpdateTrackerFn/src/index.js` file and replace its contents with the ones you can find in the [`amplify/backend/function/iotUpdateTrackerFn/src/index.js`](amplify/backend/function/iotUpdateTrackerFn/src/index.js) of this repo.

Finally, open the `amplify/backend/function/iotUpdateTrackerFn/custom-policies.json` file and replace its contents with the following:

```json
[
  {
    "Action": ["geo:BatchUpdateDevicePosition"],
    "Resource": [
      "arn:aws:geo:[region-name]:[account-id]:tracker/tracker_supplychain"
    ]
  }
]
```

**Note**: Make sure to update the arn to include the AWS Region and [Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html) of your Amplify project.

Proceed to add another function, this one will be used as custom Lambda resolver for AppSync and it will be in charge of starting an itinerary:

```sh
amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: startItineraryFn
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration
- Environment variables configuration
- Secret values configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? Yes
? Select the categories you want this function to have access to. function, storage
? Function has 3 resources in this project. Select the one you would like your Lambda to access deviceSimulatorFn
? Select the operations you want to permit on deviceSimulatorFn read
? Select the operations you want to permit on Itinerary:@model(appsync) read, update

You can access the following resource attributes as environment variables from your Lambda function
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        ENV
        FUNCTION_DEVICESIMULATORFN_NAME
        REGION
? Do you want to invoke this function on a recurring schedule? No
? Do you want to enable Lambda layers for this function? Yes
? Provide existing layers or select layers in this project to access from this function (pick up to 5): awssupplychaindemopowertools
? Select a version for awssupplychaindemopowertools: Always choose latest version
? Do you want to configure environment variables for this function? Yes
? Enter the environment variable name: POWERTOOLS_SERVICE_NAME
? Enter the environment variable value: startItineraryFn
? Select what you want to do with environment variables: I'm done

You can access the following resource attributes as environment variables from your Lambda function
        ENV
        REGION
        FUNCTION_DEVICESIMULATORFN_NAME
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
        API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
        API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
        POWERTOOLS_SERVICE_NAME
? Do you want to configure secret values this function can access? No
? Do you want to edit the local lambda function now? No
Successfully added resource startItineraryFn locally.

# Additional logs were removed for brevity
```

Just like before, in the `amplify/backend/function/startItineraryFn/src` folder, run the following command with your terminal:

```
npm i @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb @aws-sdk/client-lambda
```

Then open the `amplify/backend/function/startItineraryFn/src/index.js` file and replace its contents with the ones you can find in the [`amplify/backend/function/startItineraryFn/src/index.js`](amplify/backend/function/startItineraryFn/src/index.js) of this repo.

Then, add one last function, this one will be used to retrieve the position of a decvice via AppSync:

```sh
amplify add function
? Select which capability you want to add: Lambda function (serverless function)
? Provide an AWS Lambda function name: getDevicePositionFn
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World

Available advanced settings:
- Resource access permissions
- Scheduled recurring invocation
- Lambda layers configuration
- Environment variables configuration
- Secret values configuration

? Do you want to configure advanced settings? Yes
? Do you want to access other resources in this project from your Lambda function? No
? Do you want to invoke this function on a recurring schedule? No
? Do you want to enable Lambda layers for this function? Yes
? Provide existing layers or select layers in this project to access from this function (pick up to 5): awssupplychaindemopowertools
? Select a version for awssupplychaindemopowertools: Always choose latest version
? Do you want to configure environment variables for this function? Yes
? Enter the environment variable name: TRACKER_NAME
? Enter the environment variable value: tracker_supplychain
? Select what you want to do with environment variables: Add new environment variable
? Enter the environment variable name: POWERTOOLS_SERVICE_NAME
? Enter the environment variable value: getDevicePositionFn
? Select what you want to do with environment variables: I'm done

You can access the following resource attributes as environment variables from your Lambda function
        ENV
        REGION
        TRACKER_NAME
        POWERTOOLS_SERVICE_NAME
? Do you want to configure secret values this function can access? No
? Do you want to edit the local lambda function now? No
Successfully added resource getDevicePositionFn locally.

# Additional logs were removed for brevity
```

Once again, in the `amplify/backend/function/getDevicePositionFn/src` folder, run the following command with your terminal:

```
npm i @aws-sdk/client-location
```

Then open the `amplify/backend/function/getDevicePositionFn/src/index.js` file and replace its contents with the ones you can find in the [`amplify/backend/function/getDevicePositionFn/src/index.js`](amplify/backend/function/getDevicePositionFn/src/index.js) of this repo.

Finally, open the `amplify/backend/function/getDevicePositionFn/custom-policies.json` file and replace its contents with the following:

```json
[
  {
    "Action": [
      "geo:GetDevicePosition",
      "geo:BatchGetDevicePosition"
    ],
    "Resource": [
      "arn:aws:geo:[region-name]:[account-id]:tracker/tracker_supplychain"
    ]
  }
]
```

#### Step 7: Update the GraphQL schema

Now that we have added more functions, we need to update the GraphQL schema to include the custom mutations and queries.

Open the `amplify/backend/schema/schema.graphql` file and add the following statements to it:

```graphql
type Mutation {
  optimized(id: ID): Itinerary @function(name: "routeOptimizerFn-${env}")
  startItinerary(id: ID): Boolean @function(name: "startItineraryFn-${env}")
}

type Query {
  getDevicePosition(id: ID!, history: Boolean): [Coords]
    @function(name: "getDevicePositionFn-${env}")
}
```

#### Step 8: Push the resources to the cloud

Finally, push the resources to the cloud:

```sh
amplify push
⠧ Fetching updates to backend environment: dev from the cloud.GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
✔ Successfully pulled backend environment dev from the cloud.
⠦ Building resource api/awssupplychaindemoGraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema

    Current Environment: dev

┌──────────┬──────────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name                │ Operation │ Provider plugin   │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ iotResources                 │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ routeOptimizerFn             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ iotUpdateTrackerFn           │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ startItineraryFn             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ getDevicePositionFn          │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Api      │ awssupplychaindemo           │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ awssupplychaindemopowertools │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ deviceSimulatorFn            │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Auth     │ awssupplychaindemo6b91e579   │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ supplychainmap               │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ supplychainplace             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ customLocation               │ Create    │ awscloudformation │
└──────────┴──────────────────────────────┴───────────┴───────────────────┘
? Are you sure you want to continue? Yes
GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
⠦ Building resource api/awssupplychaindemoGraphQL schema compiled successfully.
Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema


Content changes in Lambda layers detected.
Suggested configuration for new layer versions:

awssupplychaindemopowertools
  - Description: Updated layer version  2022-06-27T16:53:01.232Z

? Accept the suggested layer version configurations? Yes
Content changes in Lambda layer awssupplychaindemopowertools detected.

# Additional logs were removed for brevity
```

````

At the very last question Amplify CLI will ask you if you want to generate the code for the API, answer **no**, since this sample already provides queries, mutations, and subscriptions.

```sh
? Do you want to generate code for your newly created GraphQL API No

# Additional logs were removed for brevity
````

As last step before running the application, you need to run one last command that we need to run in order to allow IoT Core to invoke the Lambda function that processes the IoT Core events:

```sh
aws lambda add-permission --function-name iotUpdateTrackerFn-dev --statement-id iot-events --action "lambda:InvokeFunction" --principal iot.amazonaws.com
```

### Run the app locally

```sh
npm start
```


### **OPTION 2**: USE PROVIDED AMPLIFY BACKEND

While still in the root of the project directory, run the following command to configure the backend:

```sh
amplify init

Note: It is recommended to run this command from the root of your app directory
? Enter a name for the environment dev
? Choose your default editor: Visual Studio Code
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify app: d2mrv0blz6ulx8
⠙ Initializing project in the cloud...

# Additional logs were removed for brevity
```

Check that the Amplify CLI is able to detect the existing backend configuration:

```sh
amplify status

    Current Environment: dev

┌──────────┬────────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name              │ Operation │ Provider plugin   │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Auth     │ awssupplychaindemo3956d534 │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ mapdfbf163d                │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ placeindex87cda5eb         │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Api      │ awssupplychaindemo         │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Function │ optimizerfn                │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Function │ devicesimulatorfn          │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Function │ iotUpdateTracker           │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Function │ startItineraryfn           │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Function │ getDevicePositionfn        │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ customLocation             │ Create    │ awscloudformation │
├──────────┼────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ iotResources               │ Create    │ awscloudformation │
└──────────┴────────────────────────────┴───────────┴───────────────────┘

GraphQL transformer version: 2
```

Before you can deploy the backend there are a few files that need to be modified:

- `amplify/backend/awscloudformation/override.ts`
- `amplify/backend/function/routeOptimizerFn/custom-policies.json`
- `amplify/backend/function/getDevicePositionFn/custom-policies.json`
- `amplify/backend/function/iotUpdateTrackerFn/custom-policies.json`
- `amplify/backend/function/deviceSimulatorFn/custom-policies.json`

All files have strings that represent ARN of other resources, for example: `arn:aws:geo:[region-name]:[account-id]:route-calculator/routecalculator_supplychain`, make sure to update the arn to include the AWS Region and [Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html) of your Amplify project.

Additionally, you'll have to run the following command to generate a new IoT Core certificate that will be used to connect to the IoT Core endpoint:

```sh
aws iot create-keys-and-certificate \
    --set-as-active \
    --certificate-pem-outfile amplify/backend/function/deviceSimulatorFn/src/certs/certificate.pem.crt \
    --public-key-outfile amplify/backend/function/deviceSimulatorFn/src/certs/public.pem.key \
    --private-key-outfile amplify/backend/function/deviceSimulatorFn/src/certs/private.pem.key

{
    "certificateArn": "arn:aws:iot:[region-name]:[account-id]:cert/xxxxx",
    "certificatePem": "-----BEGIN CERTIFICATE-----\nxxxxxxxxxx==\n-----END CERTIFICATE-----\n",
    "keyPair": {
        "PublicKey": "-----BEGIN PUBLIC KEY-----\nxxxxx\n-----END PUBLIC KEY-----\n",
        "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\nxxxxx\n-----END RSA PRIVATE KEY-----\n"
    },
    "certificateId": "[certificate-id]"
}
```

Take the value of the `certificateId` key from the output and update the `certificateId` value in the `iotResources` section of the project found in the `amplify/backend/custom/iotResources/cdk-stack.ts` file:

```ts
// Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
const CERTIFICATE_ID = "[YOUR_CERTIFICATE_ID]";
```

Finally, before deploying the resources, run one last command to find out the URL of the IoT Core endpoint for the region and account you are using:

```sh
aws iot describe-endpoint --endpoint-type iot:Data-ATS
{
    "endpointAddress": "[some-id]-ats.iot.[region-name].amazonaws.com"
}
```

Copy the endpoint address, and then paste it in the `amplify/backend/function/deviceSimulatorFn/src/index.js` file:

```js
const THING_ENDPOINT = "[some-id]-ats.iot.[region-name].amazonaws.com";
```

Finally deploy the backend to the cloud:

```sh
amplify push
Some Lambda function environment variables are missing values in this Amplify environment.
✔ Enter the missing environment variable value of ROUTE_CALCULATOR in optimizerfn: · routecalculator_supplychain
✔ Enter the missing environment variable value of ROUTE_CALCULATOR_NAME in devicesimulatorfn: · routecalculator_supplychain
✔ Enter the missing environment variable value of TRACKER_NAME in iotUpdateTracker: · tracker_supplychain
✔ Enter the missing environment variable value of TRACKER_NAME in getDevicePositionfn: · tracker_supplychain
Overrides functionality is not implemented for this category
Overrides functionality is not implemented for this category
⠏ Fetching updates to backend environment: dev from the cloud.✅ GraphQL schema compiled successfully.

Edit your schema at /home/ec2-user/environment/amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at /home/ec2-user/environment/amplify/backend/api/awssupplychaindemo/schema

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
✔ Successfully pulled backend environment dev from the cloud.
⠙ Building resource api/awssupplychaindemo GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema

    Current Environment: dev

┌──────────┬──────────────────────────────┬───────────┬───────────────────┐
│ Category │ Resource name                │ Operation │ Provider plugin   │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Auth     │ awssupplychaindemo6b91e579   │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ supplychainmap               │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Geo      │ supplychainplace             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Api      │ awssupplychaindemo           │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ awssupplychaindemopowertools │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ routeOptimizerFn             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ deviceSimulatorFn            │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ iotUpdateTrackerFn           │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ startItineraryfn             │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Function │ getDevicePositionFn          │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ customLocation               │ Create    │ awscloudformation │
├──────────┼──────────────────────────────┼───────────┼───────────────────┤
│ Custom   │ iotResources                 │ Create    │ awscloudformation │
└──────────┴──────────────────────────────┴───────────┴───────────────────┘
? Are you sure you want to continue? Yes
 GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
⠹ Building resource api/awssupplychaindemo GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/awssupplychaindemo/schema.graphql or place .graphql files in a directory at amplify/backend/api/awssupplychaindemo/schema
```

At the very last question Amplify CLI will ask you if you want to generate the code for the API, answer **no**, since this sample already provides queries, mutations, and subscriptions.

```sh
? Do you want to generate code for your newly created GraphQL API No

# Additional logs were removed for brevity
```

As last step before running the application, you need to run one last command that we need to run in order to allow IoT Core to invoke the Lambda function that processes the IoT Core events:

```sh
aws lambda add-permission --function-name iotUpdateTracker-dev --statement-id iot-events --action "lambda:InvokeFunction" --principal iot.amazonaws.com
```

When the backend is deployed, you can start the frontend application. Go to the [Run the app locally](#run-the-app-locally) section to learn how to run the frontend application locally.


## Clean up

```sh
amplify delete
```

NOTE: this lambda needs to be increased to 15 minutes, CLI doesn't support this workflow and neither does `amplify override` which is not available for the Function category. See this [GitHub Issue](https://github.com/aws-amplify/amplify-cli/issues/10644) and the [Amplify CLI docs](https://docs.amplify.aws/guides/functions/configuring-lambda/q/platform/js/) for more information.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.


import * as cdk from "@aws-cdk/core";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import * as location from "@aws-cdk/aws-location";

export class cdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name",
    });
    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */

    new location.CfnRouteCalculator(this, "AWSSupplyChainDemoRouteCalculator", {
      calculatorName: "routecalculator_supplychain",
      dataSource: "Here",
      description: "Route Calculator for the AWS Supply Chain Demo",
    });

    new location.CfnTracker(this, "Tracker", {
      trackerName: "tracker_supplychain",
      positionFiltering: "AccuracyBased",
    });
  }
}
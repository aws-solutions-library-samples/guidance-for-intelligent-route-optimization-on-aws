import * as cdk from "aws-cdk-lib";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";
import { Construct } from "constructs";
import * as location from "aws-cdk-lib/aws-location";

export class cdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
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

    new location.CfnRouteCalculator(this, "route-calculator", {
      calculatorName: "routecalculator_location_workshop",
      dataSource: "Here",
      description: "Location Workshop Route Calculator",
    });

    new location.CfnTracker(this, "Tracker", {
      trackerName: "tracker_location_workshop",
      positionFiltering: "AccuracyBased",
    });
  }
}

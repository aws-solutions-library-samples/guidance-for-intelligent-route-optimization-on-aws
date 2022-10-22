import * as cdk from "@aws-cdk/core";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";
import * as iot from "@aws-cdk/aws-iot";
import * as actions from "@aws-cdk/aws-iot-actions";
import * as lambda from "@aws-cdk/aws-lambda";

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

    // Identifier for the IoT Core Certificate, REPLACE THIS WITH YOUR CERTIFICATE ID
    const CERTIFICATE_ID =
      "6a214e5f0277cd814b1587acfbf0f3f5212232d76e73fe70c3c68f1914e2d1e8";

    // Access other Amplify Resources
    const retVal: AmplifyDependentResourcesAttributes =
      AmplifyHelpers.addResourceDependency(
        this,
        amplifyResourceProps.category,
        amplifyResourceProps.resourceName,
        [{ category: "function", resourceName: "iotUpdateTrackerFn" }]
      );
    // Get the Lambda Function reference
    const iotUpdateTrackerArn = cdk.Fn.ref(
      retVal.function.iotUpdateTrackerFn.Arn
    );
    const iotUpdateTrackerRef = lambda.Function.fromFunctionArn(
      this,
      "myFunction",
      iotUpdateTrackerArn
    );

    // Create an IoT Core Policy
    const policy = new iot.CfnPolicy(this, "Policy", {
      policyName: "trackPolicy",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "iot:Connect",
            Resource: `arn:aws:iot:${cdk.Stack.of(this).region}:${
              cdk.Stack.of(this).account
            }:client/trackerThing`,
          },
          {
            Effect: "Allow",
            Action: "iot:Publish",
            Resource: `arn:aws:iot:${cdk.Stack.of(this).region}:${
              cdk.Stack.of(this).account
            }:topic/iot/trackedAssets`,
          },
        ],
      },
    });

    // Attach the certificate to the IoT Core Policy
    const policyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(
      this,
      "MyCfnPolicyPrincipalAttachment",
      {
        policyName: policy.policyName,
        principal: `arn:aws:iot:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:cert/${CERTIFICATE_ID}`,
      }
    );
    policyPrincipalAttachment.addDependsOn(policy);

    // Create an IoT Core Thing
    const thing = new iot.CfnThing(this, "Thing", {
      thingName: "trackerThing",
    });

    // Attach the certificate to the IoT Core Thing
    const thingPrincipalAttachment = new iot.CfnThingPrincipalAttachment(
      this,
      "MyCfnThingPrincipalAttachment",
      {
        principal: `arn:aws:iot:${cdk.Stack.of(this).region}:${
          cdk.Stack.of(this).account
        }:cert/${CERTIFICATE_ID}`,
        thingName: thing.thingName,
      }
    );
    thingPrincipalAttachment.addDependsOn(thing);

    // Create an IoT Topic Rule that will trigger the Lambda Function
    new iot.TopicRule(this, "TopicRule", {
      topicRuleName: "assetTrackingRule",
      sql: iot.IotSql.fromStringAsVer20160323(
        `SELECT * FROM 'iot/trackedAssets'`
      ),
      actions: [new actions.LambdaFunctionAction(iotUpdateTrackerRef)],
    });
  }
}

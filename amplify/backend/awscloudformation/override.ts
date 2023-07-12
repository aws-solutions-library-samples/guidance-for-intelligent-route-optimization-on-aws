import {
  AmplifyProjectInfo,
  AmplifyRootStackTemplate,
} from "@aws-amplify/cli-extensibility-helper";

export function override(
  resources: AmplifyRootStackTemplate,
  amplifyProjectInfo: AmplifyProjectInfo
) {
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
            Resource: {
              "Fn::Sub":
                "arn:aws:geo:${AWS::Region}:${AWS::AccountId}:route-calculator/routecalculator_location_workshop",
            },
            Action: ["geo:CalculateRoute"],
            Effect: "Allow",
          },
        ],
      },
    },
  ];
}

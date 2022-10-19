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
            Resource: {
              "Fn::Sub":
                // eslint-disable-next-line no-template-curly-in-string
                "arn:aws:geo:${AWS::Region}:${AWS::AccountId}:route-calculator/routecalculator_supplychain",
            },
            Action: ["geo:CalculateRoute*"],
            Effect: "Allow",
          },
        ],
      },
    },
  ];
}

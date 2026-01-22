declare module "react-native-skeleton-placeholder" {
  import { ComponentType } from "react";
  import { ViewProps } from "react-native";

  type SkeletonPlaceholderProps = {
    children?: React.ReactNode;
    backgroundColor?: string;
    highlightColor?: string;
    LinearGradient?: any;
  };

  const SkeletonPlaceholder: ComponentType<SkeletonPlaceholderProps>;
  export default SkeletonPlaceholder;
}

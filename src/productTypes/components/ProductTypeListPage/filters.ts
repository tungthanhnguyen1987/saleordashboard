import { IFilter } from "@dashboard/components/Filter";
import { ProductTypeConfigurable, ProductTypeEnum } from "@dashboard/graphql";
import { commonMessages } from "@dashboard/intl";
import { FilterOpts } from "@dashboard/types";
import { createOptionsField } from "@dashboard/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum ProductTypeFilterKeys {
  configurable = "configurable",
  type = "type",
}

export interface ProductTypeListFilterOpts {
  configurable: FilterOpts<ProductTypeConfigurable>;
  type: FilterOpts<ProductTypeEnum>;
}

const messages = defineMessages({
  configurable: {
    id: "X90t9n",
    defaultMessage: "Configurable",
    description: "product type",
  },
  digital: {
    id: "dS8Adx",
    defaultMessage: "Digital",
    description: "product",
  },
  shippable: {
    id: "U5aVd8",
    defaultMessage: "Shippable",
    description: "product",
  },
  type: {
    id: "Jsh6+U",
    defaultMessage: "Type",
    description: "product type is digital or physical",
  },
});

export function createFilterStructure(
  intl: IntlShape,
  opts: ProductTypeListFilterOpts,
): IFilter<ProductTypeFilterKeys> {
  return [
    {
      ...createOptionsField(
        ProductTypeFilterKeys.configurable,
        intl.formatMessage(messages.configurable),
        [opts.configurable.value],
        false,
        [
          {
            label: intl.formatMessage(commonMessages.yes),
            value: ProductTypeConfigurable.CONFIGURABLE,
          },
          {
            label: intl.formatMessage(commonMessages.no),
            value: ProductTypeConfigurable.SIMPLE,
          },
        ],
      ),
      active: opts.configurable.active,
    },
    {
      ...createOptionsField(
        ProductTypeFilterKeys.type,
        intl.formatMessage(messages.type),
        [opts.type.value],
        false,
        [
          {
            label: intl.formatMessage(messages.digital),
            value: ProductTypeEnum.DIGITAL,
          },
          {
            label: intl.formatMessage(messages.shippable),
            value: ProductTypeEnum.SHIPPABLE,
          },
        ],
      ),
      active: opts.type.active,
    },
  ];
}

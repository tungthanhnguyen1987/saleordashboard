import {
  ChannelData,
  ChannelPriceAndPreorderArgs,
} from "@dashboard/channels/utils";
import CardTitle from "@dashboard/components/CardTitle";
import ControlledCheckbox from "@dashboard/components/ControlledCheckbox";
import { DateTimeTimezoneField } from "@dashboard/components/DateTimeTimezoneField";
import FormSpacer from "@dashboard/components/FormSpacer";
import Hr from "@dashboard/components/Hr";
import Link from "@dashboard/components/Link";
import PreviewPill from "@dashboard/components/PreviewPill";
import TableRowLink from "@dashboard/components/TableRowLink";
import { ProductErrorFragment, WarehouseFragment } from "@dashboard/graphql";
import { FormChange, FormErrors } from "@dashboard/hooks/useForm";
import { FormsetAtomicData, FormsetChange } from "@dashboard/hooks/useFormset";
import { sectionNames } from "@dashboard/intl";
import { renderCollection } from "@dashboard/misc";
import { getFormErrors, getProductErrorMessage } from "@dashboard/utils/errors";
import createNonNegativeValueChangeHandler from "@dashboard/utils/handlers/nonNegativeValueChangeHandler";
import {
  Card,
  CardContent,
  ClickAwayListener,
  Grow,
  MenuItem,
  Paper,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
} from "@material-ui/core";
import { Button, DeleteIcon, IconButton, PlusIcon } from "@saleor/macaw-ui";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { ProductCreateData } from "../ProductCreatePage";
import { ProductVariantCreateData } from "../ProductVariantCreatePage/form";
import { ProductVariantUpdateData } from "../ProductVariantPage/form";
import { messages } from "./messages";
import { useStyles } from "./styles";

export interface ProductStockFormsetData {
  quantityAllocated: number;
}
export type ProductStockInput = FormsetAtomicData<
  ProductStockFormsetData,
  string
>;
export interface ProductStockFormData {
  sku: string;
  trackInventory: boolean;
  isPreorder: boolean;
  globalThreshold: string;
  globalSoldUnits: number;
  hasPreorderEndDate: boolean;
  preorderEndDateTime?: string;
}

export interface ProductStocksProps {
  productVariantChannelListings?: ChannelData[];
  data: ProductStockFormData;
  disabled: boolean;
  errors: ProductErrorFragment[];
  formErrors:
    | FormErrors<ProductVariantCreateData>
    | FormErrors<ProductVariantUpdateData>
    | FormErrors<ProductCreateData>;
  hasVariants: boolean;
  stocks: ProductStockInput[];
  warehouses: WarehouseFragment[];
  onVariantChannelListingChange?: (
    id: string,
    data: Partial<ChannelPriceAndPreorderArgs>,
  ) => void;
  onChange: FormsetChange;
  onChangePreorderEndDate: FormChange;
  onEndPreorderTrigger?: () => void;
  onFormDataChange: FormChange;
  onWarehouseStockAdd: (warehouseId: string) => void;
  onWarehouseStockDelete: (warehouseId: string) => void;
  onWarehouseConfigure: () => void;
}

const ProductStocks: React.FC<ProductStocksProps> = ({
  data,
  disabled,
  hasVariants,
  errors,
  formErrors: localFormErrors,
  onChangePreorderEndDate,
  stocks,
  warehouses,
  productVariantChannelListings = [],
  onChange,
  onEndPreorderTrigger,
  onFormDataChange,
  onVariantChannelListingChange,
  onWarehouseStockAdd,
  onWarehouseStockDelete,
  onWarehouseConfigure,
}) => {
  const classes = useStyles();
  const intl = useIntl();
  const anchor = React.useRef<HTMLDivElement>();
  const [lastStockRowFocus, setLastStockRowFocus] = React.useState(false);
  const [isExpanded, setExpansionState] = React.useState(false);
  const unitsLeft = parseInt(data.globalThreshold, 10) - data.globalSoldUnits;

  const warehousesToAssign =
    warehouses?.filter(
      warehouse => !stocks.some(stock => stock.id === warehouse.id),
    ) || [];
  const formErrors = getFormErrors(["sku"], errors);

  const onThresholdChange =
    createNonNegativeValueChangeHandler(onFormDataChange);

  const handleWarehouseStockAdd = (warehouseId: string) => {
    onWarehouseStockAdd(warehouseId);
    setLastStockRowFocus(true);
  };

  const handleStockInputFocus = (input: HTMLDivElement) => {
    if (lastStockRowFocus && input) {
      input.focus();
      setLastStockRowFocus(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange(e);
    onFormDataChange({
      target: {
        name: "variantName",
        value: e.target.value,
      },
    });
  };

  return (
    <Card>
      <CardTitle title={intl.formatMessage(messages.title)} />
      <CardContent>
        <div className={classes.skuInputContainer}>
          <TextField
            disabled={disabled}
            error={!!formErrors.sku}
            fullWidth
            helperText={getProductErrorMessage(formErrors.sku, intl)}
            label={intl.formatMessage(messages.sku)}
            name="sku"
            onChange={handleChange}
            value={data.sku}
            data-test-id="sku"
          />
        </div>
        <ControlledCheckbox
          checked={data.isPreorder}
          name="isPreorder"
          onChange={
            onEndPreorderTrigger && data.isPreorder
              ? onEndPreorderTrigger
              : onFormDataChange
          }
          disabled={disabled}
          label={
            <>
              <FormattedMessage {...messages.variantInPreorder} />
              <PreviewPill className={classes.preview} />
            </>
          }
        />

        {!data.isPreorder && (
          <>
            <FormSpacer />
            <ControlledCheckbox
              checked={data.trackInventory}
              name="trackInventory"
              onChange={onFormDataChange}
              disabled={disabled}
              label={
                <>
                  <FormattedMessage {...messages.trackInventory} />
                  <Typography variant="caption">
                    <FormattedMessage {...messages.trackInventoryDescription} />
                  </Typography>
                </>
              }
            />
          </>
        )}
      </CardContent>
      <Hr />
      {!data.isPreorder && (
        <CardContent className={classes.quantityContainer}>
          <Typography>
            <div className={classes.quantityHeader}>
              <span>
                <FormattedMessage {...messages.quantity} />
              </span>
            </div>
          </Typography>
          {!productVariantChannelListings?.length && (
            <>
              <FormSpacer />
              <Typography variant="caption">
                <FormattedMessage {...messages.noChannelWarehousesAllocation} />
              </Typography>
            </>
          )}

          {!warehouses?.length && (
            <Typography
              color="textSecondary"
              className={classes.noWarehouseInfo}
            >
              {hasVariants ? (
                <>
                  <FormattedMessage
                    {...messages.configureWarehouseForVariant}
                    values={{
                      a: chunks => (
                        <Link onClick={onWarehouseConfigure}>{chunks}</Link>
                      ),
                    }}
                  />
                </>
              ) : (
                <>
                  <FormattedMessage
                    {...messages.configureWarehouseForProduct}
                    values={{
                      a: chunks => (
                        <Link onClick={onWarehouseConfigure}>{chunks}</Link>
                      ),
                    }}
                  />
                </>
              )}
            </Typography>
          )}
        </CardContent>
      )}
      {productVariantChannelListings?.length > 0 &&
        warehouses?.length > 0 &&
        !data.isPreorder && (
          <Table>
            <colgroup>
              <col className={classes.colName} />
              <col className={classes.colQuantity} />
              <col className={classes.colQuantity} />
            </colgroup>
            <TableHead>
              <TableRowLink>
                <TableCell className={classes.colName}>
                  <FormattedMessage {...messages.warehouseName} />
                </TableCell>
                <TableCell className={classes.colQuantity}>
                  <FormattedMessage {...messages.allocated} />
                </TableCell>
                <TableCell className={classes.colQuantity}>
                  <FormattedMessage {...messages.quantity} />
                </TableCell>
                <TableCell className={classes.colAction} />
              </TableRowLink>
            </TableHead>
            <TableBody>
              {renderCollection(stocks, (stock, index) => {
                const handleQuantityChange =
                  createNonNegativeValueChangeHandler(event =>
                    onChange(stock.id, event.target.value),
                  );

                return (
                  <TableRowLink key={stock.id}>
                    <TableCell className={classes.colName}>
                      {stock.label}
                    </TableCell>
                    <TableCell className={classes.colQuantity}>
                      {stock.data?.quantityAllocated || 0}
                    </TableCell>
                    <TableCell className={classes.colQuantity}>
                      <TextField
                        data-test-id="stock-input"
                        disabled={disabled}
                        fullWidth
                        inputProps={{
                          className: classes.input,
                          min: 0,
                          type: "number",
                        }}
                        onChange={handleQuantityChange}
                        value={stock.value}
                        inputRef={input =>
                          stocks.length === index + 1 &&
                          handleStockInputFocus(input)
                        }
                      />
                    </TableCell>
                    <TableCell className={classes.colAction}>
                      <IconButton
                        variant="secondary"
                        color="primary"
                        onClick={() => onWarehouseStockDelete(stock.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRowLink>
                );
              })}
              {warehousesToAssign.length > 0 && (
                <ClickAwayListener onClickAway={() => setExpansionState(false)}>
                  <TableRowLink
                    className={classes.addRow}
                    onClick={() => setExpansionState(!isExpanded)}
                  >
                    <TableCell colSpan={3} className={classes.actionableText}>
                      <Typography variant="body2">
                        <FormattedMessage {...messages.assignWarehouse} />
                      </Typography>
                    </TableCell>
                    <TableCell className={classes.colAction}>
                      <div ref={anchor}>
                        <IconButton
                          data-test-id="add-warehouse"
                          color="primary"
                          variant="secondary"
                          className={classes.actionableText}
                        >
                          <PlusIcon />
                        </IconButton>
                        <Popper
                          className={classes.popper}
                          open={isExpanded}
                          anchorEl={anchor.current}
                          transition
                          placement="top-end"
                        >
                          {({ TransitionProps }) => (
                            <Grow
                              {...TransitionProps}
                              style={{
                                transformOrigin: "right top",
                              }}
                            >
                              <Paper className={classes.paper} elevation={8}>
                                {warehousesToAssign.map(warehouse => (
                                  <MenuItem
                                    className={classes.menuItem}
                                    onClick={() =>
                                      handleWarehouseStockAdd(warehouse.id)
                                    }
                                  >
                                    {warehouse.name}
                                  </MenuItem>
                                ))}
                              </Paper>
                            </Grow>
                          )}
                        </Popper>
                      </div>
                    </TableCell>
                  </TableRowLink>
                </ClickAwayListener>
              )}
            </TableBody>
          </Table>
        )}
      {data.isPreorder && (
        <CardContent>
          <Typography variant="caption" className={classes.caption}>
            <FormattedMessage {...messages.preorderEndDateSetup} />
          </Typography>

          {data.hasPreorderEndDate && (
            <div className={classes.dateTimeInputs}>
              <DateTimeTimezoneField
                name={"preorderEndDateTime"}
                disabled={disabled}
                futureDatesOnly
                fullWidth={false}
                error={localFormErrors.preorderEndDateTime}
                value={data?.preorderEndDateTime}
                onChange={event =>
                  onChangePreorderEndDate({
                    target: {
                      name: "preorderEndDateTime",
                      value: event,
                    },
                  })
                }
              />
            </div>
          )}
          <Button
            name="hasPreorderEndDate"
            variant="tertiary"
            disabled={disabled}
            onClick={() =>
              onFormDataChange({
                target: {
                  name: "hasPreorderEndDate",
                  value: !data.hasPreorderEndDate,
                },
              })
            }
          >
            {data.hasPreorderEndDate
              ? intl.formatMessage(messages.endDateCancel)
              : intl.formatMessage(messages.endDateSetup)}
          </Button>
          <Typography variant="caption" className={classes.preorderLimitInfo}>
            <FormattedMessage {...messages.preorderProductsAvailability} />
          </Typography>
          <div className={classes.thresholdRow}>
            <TextField
              inputProps={{
                min: 0,
              }}
              disabled={disabled}
              fullWidth
              helperText={intl.formatMessage(
                messages.preorderTresholdDescription,
              )}
              label={intl.formatMessage(messages.preorderTresholdLabel)}
              name="globalThreshold"
              onChange={onThresholdChange}
              value={data.globalThreshold ?? ""}
              className={classes.thresholdInput}
            />
            {productVariantChannelListings?.length > 0 && (
              <Typography
                variant="caption"
                className={classes.preorderItemsLeftCount}
              >
                {data.globalThreshold
                  ? intl.formatMessage(messages.preorderTresholdUnitsLeft, {
                      unitsLeft,
                    })
                  : intl.formatMessage(messages.preorderTresholdUnlimited)}
              </Typography>
            )}
          </div>
        </CardContent>
      )}

      {productVariantChannelListings?.length > 0 && data.isPreorder && (
        <Table>
          <colgroup>
            <col className={classes.colName} />
            <col className={classes.colSoldUnits} />
            <col className={classes.colThreshold} />
          </colgroup>
          <TableHead>
            <TableRowLink>
              <TableCell className={classes.colName}>
                <FormattedMessage {...sectionNames.channels} />
              </TableCell>
              <TableCell className={classes.colSoldUnits}>
                <FormattedMessage {...messages.soldUnits} />
              </TableCell>
              <TableCell className={classes.colThreshold}>
                <FormattedMessage {...messages.channelTreshold} />
              </TableCell>
            </TableRowLink>
          </TableHead>
          <TableBody>
            {renderCollection(productVariantChannelListings, listing => {
              if (!listing) {
                return;
              }

              return (
                <TableRowLink key={listing.id}>
                  <TableCell className={classes.colName}>
                    {listing.name}
                  </TableCell>
                  <TableCell className={classes.colQuantity}>
                    {listing?.unitsSold || 0}
                  </TableCell>
                  <TableCell className={classes.colQuantity}>
                    <TextField
                      name="channel-threshold"
                      disabled={disabled}
                      fullWidth
                      inputProps={{
                        className: classes.input,
                        min: 0,
                        type: "number",
                      }}
                      placeholder={intl.formatMessage(
                        messages.preorderTresholdUnlimited,
                      )}
                      onChange={e => {
                        onVariantChannelListingChange(listing.id, {
                          costPrice: listing.costPrice,
                          price: listing.price,
                          preorderThreshold:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        });
                      }}
                      value={listing?.preorderThreshold ?? ""}
                    />
                  </TableCell>
                </TableRowLink>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

ProductStocks.displayName = "ProductStocks";
export default ProductStocks;

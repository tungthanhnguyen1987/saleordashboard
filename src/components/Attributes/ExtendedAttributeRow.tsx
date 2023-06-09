import { Button } from "@dashboard/components/Button";
import Grid from "@dashboard/components/Grid";
import { Typography } from "@material-ui/core";
import React from "react";

import { useExtendedAttributeStyles } from "./styles";

interface ExtendedAttributeRowProps {
  label: string;
  selectLabel: string;
  disabled: boolean;
  onSelect: () => void;
}

const ExtendedAttributeRow: React.FC<ExtendedAttributeRowProps> = props => {
  const { label, selectLabel, disabled, onSelect, children } = props;
  const classes = useExtendedAttributeStyles(props);

  return (
    <>
      <Grid className={classes.attributeSection} variant="uniform">
        <div
          className={classes.attributeSectionLabel}
          data-test-id="attribute-label"
        >
          <Typography>{label}</Typography>
        </div>
        <div data-test-id="attribute-selector">
          <Button
            className={classes.attributeSectionButton}
            disabled={disabled}
            variant="tertiary"
            data-test-id="button-attribute-selector"
            onClick={onSelect}
          >
            {selectLabel}
          </Button>
        </div>
      </Grid>
      <div data-test-id="attribute-value">{children}</div>
    </>
  );
};

ExtendedAttributeRow.displayName = "ExtendedAttributeRow";
export default ExtendedAttributeRow;

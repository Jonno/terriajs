import { action, computed, runInAction, autorun, reaction } from "mobx";
import TerriaError from "../Core/TerriaError";
import YDYRCatalogFunctionTraits from "../Traits/YDYRCatalogFunctionTraits";
import CreateModel from "./CreateModel";
import FunctionParameter from "./FunctionParameters/FunctionParameter";
import i18next from "i18next";
import CatalogFunctionMixin from "../ModelMixins/CatalogFunctionMixin";
import EnumerationParameter from "./FunctionParameters/EnumerationParameter";
import TableMixin from "../ModelMixins/TableMixin";
import isDefined from "../Core/isDefined";
import TableColumnType from "../Table/TableColumnType";
import BooleanParameter from "./FunctionParameters/BooleanParameter";
import loadWithXhr from "../Core/loadWithXhr";
import proxyCatalogItemUrl from "./proxyCatalogItemUrl";
import filterOutUndefined from "../Core/filterOutUndefined";
import loadJson from "../Core/loadJson";
import loadText from "../Core/loadText";
import CsvCatalogItem from "./CsvCatalogItem";
import CommonStrata from "./CommonStrata";
import StringParameter from "./FunctionParameters/StringParameter";
import ResultPendingCatalogItem from "./ResultPendingCatalogItem";

export const DATASETS = [
  {
    title: "ABS - 2011 Statistical Areas Level 1",
    filename: "SA1_2011_AUST",
    dataCol: "SA1_MAIN11",
    geographyName: "SA1_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Statistical Areas Level 2",
    filename: "SA2_2011_AUST",
    dataCol: "SA2_MAIN11",
    geographyName: "SA2_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Statistical Areas Level 3",
    filename: "SA3_2011_AUST",
    dataCol: "SA3_CODE11",
    geographyName: "SA3_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Statistical Areas Level 4",
    filename: "SA4_2011_AUST",
    dataCol: "SA4_CODE11",
    geographyName: "SA4_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Local Government Areas",
    filename: "LGA_2011_AUST",
    dataCol: "LGA_CODE11",
    geographyName: "LGA_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Commonwealth Electoral Divisions",
    filename: "CED_2011_AUST",
    dataCol: "CED_CODE11",
    geographyName: "CED_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 State Electoral Divisions",
    filename: "SED_2011_AUST",
    dataCol: "SED_CODE11",
    geographyName: "SED_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Remoteness Areas 2011",
    filename: "RA_2011_AUST",
    dataCol: "RA_CODE11",
    geographyName: "RA_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 State Suburbs",
    filename: "SSC_2011_AUST",
    dataCol: "SSC_CODE11",
    geographyName: "SSC_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2011 Postal Areas",
    filename: "POA_2011_AUST",
    dataCol: "POA_CODE",
    geographyName: "POA_2011",
    sideData: "BCP_2011"
  },
  {
    title: "ABS - 2016 Statistical Areas Level 1",
    filename: "SA1_2016_AUST",
    dataCol: "SA1_MAIN16",
    geographyName: "SA1_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Statistical Areas Level 2",
    filename: "SA2_2016_AUST",
    dataCol: "SA2_MAIN16",
    geographyName: "SA2_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Statistical Areas Level 3",
    filename: "SA3_2016_AUST",
    dataCol: "SA3_CODE16",
    geographyName: "SA3_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Statistical Areas Level 4",
    filename: "SA4_2016_AUST",
    dataCol: "SA4_CODE16",
    geographyName: "SA4_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Local Government Areas",
    filename: "LGA_2016_AUST",
    dataCol: "LGA_CODE16",
    geographyName: "LGA_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Commonwealth Electoral Divisions",
    filename: "CED_2016_AUST",
    dataCol: "CED_CODE16",
    geographyName: "CED_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 State Electoral Divisions",
    filename: "SED_2016_AUST",
    dataCol: "SED_CODE16",
    geographyName: "SED_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - Remoteness Areas 2016",
    filename: "RA_2016_AUST",
    dataCol: "RA_CODE16",
    geographyName: "RA_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 State Suburbs",
    filename: "SSC_2016_AUST",
    dataCol: "SSC_CODE16",
    geographyName: "SSC_2016",
    sideData: "BCP_2016"
  },
  {
    title: "ABS - 2016 Postal Areas",
    filename: "POA_2016_AUST",
    dataCol: "POA_CODE16",
    geographyName: "POA_2016",
    sideData: "BCP_2016"
  }
];

export const SIDE_DATA = [
  { title: "Basic Community profile 2011", id: "BCP_2011" },
  { title: "Basic Community profile 2016", id: "BCP_2016" }
];

export const ALGORITHMS: [string, boolean][] = [
  ["Negative Binomial", true],
  ["Population Weighted", false],
  ["Poisson Linear", false],
  ["Ridge Regressor", false]
];

export default class YDYRCatalogFunction extends CatalogFunctionMixin(
  CreateModel(YDYRCatalogFunctionTraits)
) {
  static readonly type = "ydyr";
  readonly typeName = "YourDataYourRegions";

  private _inputLayers?: EnumerationParameter;
  private _dataColumn?: EnumerationParameter;
  private _regionColumn?: EnumerationParameter;

  async forceLoadMetadata() {
    // autorun(() => {
    //   console.log('running autorun');
    //   [this.inputLayers, this.dataColumn, this.regionColumn].forEach(
    //     enumParam => {
    //       // Clear value if no possibleValues
    //       if (enumParam.possibleValues.length === 0) {
    //         enumParam.clearValue(CommonStrata.user);

    //         // If value isn't defined or is invalid -> if a value isRequired, then set to first option
    //       } else if (
    //         !isDefined(enumParam.value) ||
    //         !enumParam.possibleValues.includes(enumParam.value)
    //       ) {
    //         if (enumParam.isRequired) {
    //           enumParam.setValue(
    //             CommonStrata.user,
    //             enumParam.possibleValues[0]
    //           );
    //         } else {
    //           enumParam.clearValue(CommonStrata.user);
    //         }
    //       }
    //     }
    //   );
    // });

    reaction(
      () => this.parameters,
      (value: any) => {
        console.log(value);
      }
    );
  }

  @computed
  get selectedTableCatalogMember(): TableMixin.TableMixin | undefined {
    if (!isDefined(this.inputLayers?.value)) {
      return;
    }
    const layer = this.terria.workbench.items
      .filter(TableMixin.isMixedInto)
      .filter(item => item.uniqueId === this.inputLayers!.value)[0];

    return layer;
  }

  @computed
  get inputLayers(): EnumerationParameter {
    const possibleValues = this.terria.workbench.items
      .filter(
        item =>
          TableMixin.isMixedInto(item) && item.activeTableStyle.isRegions()
      )
      .map(item => item.uniqueId)
      .filter(isDefined);
    this._inputLayers = new EnumerationParameter(this, {
      id: "Input Layer",
      possibleValues,

      isRequired: true
    });
    return this._inputLayers;
  }

  @computed
  get regionColumn(): EnumerationParameter {
    const possibleValues =
      this.selectedTableCatalogMember?.tableColumns
        // Filter region columns which use supported regions
        .filter(
          col =>
            col.type === TableColumnType.region &&
            isDefined(
              DATASETS.find(d => d.dataCol === col.regionType?.regionProp)
            )
        )
        .map(col => col.name) || [];
    this._regionColumn = new EnumerationParameter(this, {
      id: "Region Column",
      possibleValues,

      isRequired: true
    });
    return this._regionColumn;
  }

  @computed
  get dataColumn(): EnumerationParameter {
    const possibleValues =
      this.selectedTableCatalogMember?.tableColumns
        .filter(col => col.type === TableColumnType.scalar)
        .map(col => col.name) || [];
    this._dataColumn = new EnumerationParameter(this, {
      id: "Data Column",
      possibleValues,
      isRequired: true
    });
    return this._dataColumn;
  }

  @computed get availableRegions(): EnumerationParameter {
    return new EnumerationParameter(this, {
      id: "Output Geography",
      possibleValues: DATASETS.map(d => d.title),
      isRequired: true
    });
  }

  @computed get algorithmParameters(): BooleanParameter[] {
    return ALGORITHMS.map(
      alg =>
        new BooleanParameter(this, {
          id: alg[0]
          // value: alg[1]
          // trueName: "Enabled",
          // falseName: "Disabled"
        })
    );
  }

  // @computed get sidedataParameters(): EnumerationParameter {
  //   const possibleValues = SIDE_DATA.map(data => data.title);
  //   let value = possibleValues[0]
  //   if (isDefined(this.availableRegions.value)) {

  //   }
  //   return new EnumerationParameter({
  //     id: "Side data",
  //     possibleValues,
  //     value: possibleValues[0]
  //   });
  // }

  @computed get authenticationParameters(): StringParameter[] {
    return [
      new StringParameter(this, { id: "Username", isRequired: true }),
      new StringParameter(this, { id: "Password", isRequired: true })
    ];
  }
  /**
   *  Maps the input to function parameters.
   */
  @computed
  get functionParameters(): FunctionParameter[] {
    console.log(this);
    return [
      this.inputLayers,
      this.regionColumn,
      this.dataColumn,
      this.availableRegions,
      ...this.algorithmParameters,
      ...this.authenticationParameters
      // this.sidedataParameters
    ];
  }

  /**
   * Performs the Execute request for the WPS process
   *
   * If `executeWithHttpGet` is true, a GET request is made
   * instead of the default POST request.
   */
  @action
  async invoke() {
    if (
      !isDefined(this.regionColumn.value) ||
      !isDefined(this.dataColumn.value)
    ) {
      throw `The Region column and Data column must be defined`;
    }

    const data = {
      ids: this.selectedTableCatalogMember?.findColumnByName(
        this.regionColumn.value
      )?.values,
      values: this.selectedTableCatalogMember?.findColumnByName(
        this.dataColumn.value
      )?.valuesAsNumbers.values
    };

    if (!data.ids?.length || !data.values?.length) {
      throw `The column selected has no valid data values`;
    }

    // Remove rows with null values
    const invalidRows: number[] = filterOutUndefined(
      data.values.map((val, idx) => (val === null ? idx : undefined))
    );

    console.log(invalidRows);

    data.ids = data.ids.filter((id, idx) => !invalidRows.includes(idx));
    data.values = data.values.filter(
      (value, idx) => !invalidRows.includes(idx)
    );

    const params = {
      data,
      data_column: this.dataColumn.value,
      geom_column: this.regionColumn.value,
      side_data: DATASETS.find(d => d.title === this.availableRegions.value)
        ?.sideData,
      dst_geom: DATASETS.find(d => d.title === this.availableRegions.value)
        ?.geographyName,
      src_geom: this.selectedTableCatalogMember?.activeTableStyle.regionColumn
        ?.regionType?.regionType,
      averaged_counts: false,
      algorithms: this.algorithmParameters
        .filter(alg => alg.value)
        .map(alg => alg.id)
    };

    const jobId = await loadWithXhr({
      url: proxyCatalogItemUrl(
        this,
        `https://${this.authenticationParameters[0].value}:${this.authenticationParameters[1].value}@ydyr.info/api/v1/disaggregate.json`
      ),
      method: "POST",
      data: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
      responseType: "json"
    });

    if (typeof jobId !== "string") {
      throw `The YDYR server didn't provide a valid job id.`;
    }

    //   switch(createJobReponse.status) {
    //     case 202:
    //       createJobReponse.response
    //       break
    //     case 500:
    //       break
    //     default:
    //       break
    //   }

    //   if(r.status === 202) {
    //     // then the request was accepted
    //     r.json().then(j => poller(j));
    // } else if(r.status === 500) {
    //     // server error
    //     r.json().then(e => error({
    //         title: (e && e.title) || 'Server Error',
    //         detail: 'Job failed to submit' +
    //             ((e && e.detail) ? (': ' + e.detail) : '')}));
    // } else {
    //     const subber = s => {
    //         if(s.includes('is not valid under any of the given schemas')) {
    //             return 'invalid JSON data';
    //         }
    //         return s.length < 100 ? s : (s.substring(0, 100) + '...');
    //     }

    //     r.json()
    //       .then(e => error({
    //         title: (e && e.title) || 'Server Error',
    //         detail: 'Unexpected status (' + r.status.toString() + ') ' +
    //             'when submitting job' +
    //                 ((e && e.detail) ? (': ' + subber(e.detail)) : '')}))
    //       .catch(e => error({
    //         title: (e && e.title) || 'Error parsing JSON response',
    //         detail: `Received ${r.status} response code and failed to parse response as JSON`
    //       }));
    // }

    // const resultPendingCatalogItem = this.createPendingCatalogItem()
    // this.terria.workbench.add(resultPendingCatalogItem);

    this.pollForResults(jobId);

    console.log(params);
  }

  async pollForResults(jobId: string, attempt = 0) {
    const status = await loadJson(
      proxyCatalogItemUrl(
        this,
        `https://${this.authenticationParameters[0].value}:${this.authenticationParameters[1].value}@ydyr.info/api/v1/status/${jobId}`
      ),
      { "Cache-Control": "no-cache" }
    );

    if (typeof status !== "string") {
      console.log("COMPLETED");
      console.log(status);
      this.downloadResults(status.key);
      return;
    } else {
      // resultPendingCatalogItem?.setTrait(
      //   CommonStrata.user,
      //   "description",
      //   status
      // );
      console.log(status);
    }

    setTimeout(this.pollForResults.bind(this, jobId, attempt + 1), 1000);
  }

  async downloadResults(key: string) {
    // resultPendingCatalogItem.setTrait(
    //   CommonStrata.user,
    //   "description",
    //   "Job has finished, downloading CSV data"
    // );
    const csv = await loadText(
      proxyCatalogItemUrl(
        this,
        `https://${this.authenticationParameters[0].value}:${this.authenticationParameters[1].value}@ydyr.info/api/v1/download/${key}?format=csv`
      )
    );
    const item = new CsvCatalogItem(`${this.uniqueId}-result`, this.terria);
    runInAction(() => {
      item.setTrait(CommonStrata.user, "name", "YDYR results");
      item.setTrait(CommonStrata.user, "csvString", csv);
    });
    await item.loadMapItems();
    // this.terria.workbench.remove(resultPendingCatalogItem);

    this.terria.workbench.add(item);
  }
}

function throwInvalidWpsServerError(
  wps: YDYRCatalogFunction,
  endpoint: string
) {
  throw new TerriaError({
    title: i18next.t("models.YDYR.invalidWPSServerTitle"),
    message: i18next.t("models.YDYR.invalidWPSServerMessage", {
      name: wps.name,
      email:
        '<a href="mailto:' +
        wps.terria.supportEmail +
        '">' +
        wps.terria.supportEmail +
        "</a>.",
      endpoint
    })
  });
}
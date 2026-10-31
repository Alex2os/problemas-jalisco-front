const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServiceClient } = require("./load-services.cjs");

const {
  getReportDisplayTitle,
  getReportLocationSummary,
  reportShortDate,
} = createServiceClient().load("services/report-format");

test("getReportDisplayTitle uses valid original title when present", () => {
  assert.equal(
    getReportDisplayTitle({
      title: "¡Otra vez sin agua!",
      type: "agua",
      colonia: "La Normal",
    }),
    "¡Otra vez sin agua!",
  );

  assert.equal(
    getReportDisplayTitle({
      title: "  Luminaria fundida en la esquina  ",
      type: "alumbrado",
    }),
    "Luminaria fundida en la esquina",
  );
});

test("getReportDisplayTitle ignores empty or whitespace-only titles and builds descriptive fallback", () => {
  assert.equal(
    getReportDisplayTitle({
      title: "",
      type: "agua",
      colonia: "La Normal",
    }),
    "Problema de agua en La Normal",
  );

  assert.equal(
    getReportDisplayTitle({
      title: "   ",
      category: "alumbrado",
    }),
    "Problema de alumbrado público",
  );
});

test("getReportDisplayTitle combines category and structured colonia or municipality", () => {
  assert.equal(
    getReportDisplayTitle({
      type: "agua",
      colonia: "La Normal",
      municipality: "Guadalajara",
    }),
    "Problema de agua en La Normal",
  );

  assert.equal(
    getReportDisplayTitle({
      type: "baches",
      colonia: "  ",
      municipality: "Zapopan",
    }),
    "Problema de baches y vialidad en Zapopan",
  );

  assert.equal(
    getReportDisplayTitle({
      type: "basura",
      colonia: "Americana",
    }),
    "Problema de basura en Americana",
  );

  assert.equal(
    getReportDisplayTitle({
      type: "seguridad",
      colonia: "Centro",
    }),
    "Problema de seguridad urbana en Centro",
  );

  assert.equal(
    getReportDisplayTitle({
      type: "arboles",
      colonia: "Providencia",
    }),
    "Problema de árboles y parques en Providencia",
  );
});

test("getReportDisplayTitle uses only category when structured colonia/municipality is absent without parsing ubication", () => {
  assert.equal(
    getReportDisplayTitle({
      type: "alumbrado",
      ubication: "Av. Alcalde 123, Centro, Guadalajara, Jalisco",
    }),
    "Problema de alumbrado público",
  );

  assert.equal(
    getReportDisplayTitle({
      type: "corte-de-servicios",
    }),
    "Problema de alumbrado público",
  );
});

test("getReportDisplayTitle returns 'Problema reportado' when category is unknown, otro, or missing", () => {
  assert.equal(getReportDisplayTitle({ type: "otro", colonia: "Centro" }), "Problema reportado");
  assert.equal(getReportDisplayTitle({ type: "otros", colonia: "Centro" }), "Problema reportado");
  assert.equal(getReportDisplayTitle({ type: "desconocido", colonia: "Centro" }), "Problema reportado");
  assert.equal(getReportDisplayTitle({}), "Problema reportado");
  assert.equal(getReportDisplayTitle(null), "Problema reportado");
  assert.equal(getReportDisplayTitle(undefined), "Problema reportado");
});

test("getReportDisplayTitle does not mutate the input report object", () => {
  const original = Object.freeze({
    id: 10,
    type: "agua",
    colonia: "La Normal",
    ubication: "Av. Alcalde 500",
  });
  const title = getReportDisplayTitle(original);
  assert.equal(title, "Problema de agua en La Normal");
  assert.equal("title" in original, false);
});

test("getReportLocationSummary returns structured colonia or municipality, or null without inventing from ubication", () => {
  assert.equal(
    getReportLocationSummary({ colonia: "La Normal", municipality: "Guadalajara" }),
    "La Normal",
  );
  assert.equal(
    getReportLocationSummary({ colonia: "", municipality: "Tlajomulco" }),
    "Tlajomulco",
  );
  assert.equal(
    getReportLocationSummary({ ubication: "Calle Morelos 10, Centro, Guadalajara" }),
    null,
  );
  assert.equal(getReportLocationSummary(null), null);
});

test("reportShortDate formats valid ISO dates and returns empty string for invalid or missing dates", () => {
  assert.equal(reportShortDate(null), "");
  assert.equal(reportShortDate(undefined), "");
  assert.equal(reportShortDate("not-a-date"), "");
  assert.ok(reportShortDate("2026-05-15T12:00:00Z").length > 0);
});


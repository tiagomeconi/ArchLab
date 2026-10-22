function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var ucs2length$1 = {};
var hasRequiredUcs2length;
function requireUcs2length() {
  if (hasRequiredUcs2length) return ucs2length$1;
  hasRequiredUcs2length = 1;
  Object.defineProperty(ucs2length$1, "__esModule", { value: true });
  function ucs2length2(str) {
    const len = str.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
      length++;
      value = str.charCodeAt(pos++);
      if (value >= 55296 && value <= 56319 && pos < len) {
        value = str.charCodeAt(pos);
        if ((value & 64512) === 56320)
          pos++;
      }
    }
    return length;
  }
  ucs2length$1.default = ucs2length2;
  ucs2length2.code = 'require("ajv/dist/runtime/ucs2length").default';
  return ucs2length$1;
}
var ucs2lengthExports = /* @__PURE__ */ requireUcs2length();
const ucs2length = /* @__PURE__ */ getDefaultExportFromCjs(ucs2lengthExports);
const schema31 = { "properties": { "metadata": { "properties": { "locale": { "enum": ["pt-BR", "en"] } } }, "configuration": { "properties": { "loadMode": { "enum": ["average", "peak"] } } } } };
const schema44 = { "properties": { "kind": { "enum": ["flow", "policy", "manual"] } } };
const schema45 = { "properties": { "id": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "operationId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "source": { "type": "string", "enum": ["external", "queue"] }, "queueSourceNodeId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "averageRps": { "type": "number", "minimum": 0 }, "peakRps": { "type": "number", "minimum": 0 }, "payloadBytes": { "type": "number", "minimum": 0 }, "concurrentConnections": { "type": "number", "minimum": 0 }, "deadlineMs": { "type": "number", "exclusiveMinimum": 0 }, "mutable": { "type": "boolean" }, "manual": { "type": "boolean" } } };
const schema48 = { "properties": { "semantics": { "enum": ["required", "optional", "degradable"] } } };
const schema49 = { "properties": { "id": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "type": { "type": "string", "enum": ["traffic-10x", "traffic-100x", "database-latency", "database-unavailable", "redis-unavailable", "queue-backlog", "network-latency", "service-unavailable", "region-failure", "high-cpu", "memory-pressure", "traffic-spike"] }, "targetKind": { "type": "string", "enum": ["global", "node", "edge", "region", "workload", "instance"] }, "targetId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "startSec": { "type": "number", "minimum": 0 }, "durationSec": { "type": "number", "exclusiveMinimum": 0 }, "magnitude": { "type": "number", "minimum": 0 }, "recoverySec": { "type": "number", "minimum": 0 }, "backlogAgeSec": { "type": "number", "minimum": 0 } } };
const schema32 = { "properties": { "type": { "enum": ["client", "web-app", "mobile-app", "api-gateway", "load-balancer", "backend", "microservice", "database", "sql-database", "nosql-database", "redis", "kafka", "queue", "worker", "cdn", "object-storage", "search-engine", "websocket", "dns", "authentication-service", "notification-service", "iot-device", "external-system", "iot-gateway", "mqtt-broker", "iot-platform", "edge-compute", "waf", "service-mesh", "rate-limiter", "container", "kubernetes", "serverless", "vm", "scheduler", "workflow-engine", "stream-processor", "batch-processor", "ml-service", "timeseries-db", "graph-db", "vector-db", "data-warehouse", "event-bus", "secrets-manager", "service-discovery", "observability", "payment-gateway", "third-party-api"] } } };
const pattern4 = new RegExp("^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$", "u");
const func1 = ucs2length;
const schema33 = { "properties": { "profileId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "replicas": { "type": "integer", "minimum": 1, "maximum": 100 }, "placements": { "type": "array", "items": { "$ref": "#/$defs/placement" }, "maxItems": 20 }, "overrides": { "$ref": "#/$defs/override" }, "cache": { "$ref": "#/$defs/cache" }, "queue": { "$ref": "#/$defs/queue" }, "storage": { "$ref": "#/$defs/storage" }, "replication": { "$ref": "#/$defs/replication" }, "policy": { "$ref": "#/$defs/policy" } } };
const schema35 = { "properties": { "capacityPerInstance": { "properties": { "compute": { "type": "number", "minimum": 0 }, "read": { "type": "number", "minimum": 0 }, "write": { "type": "number", "minimum": 0 }, "message": { "type": "number", "minimum": 0 }, "job": { "type": "number", "minimum": 0 }, "lookup": { "type": "number", "minimum": 0 }, "transfer": { "type": "number", "minimum": 0 }, "resolve": { "type": "number", "minimum": 0 }, "connection": { "type": "number", "minimum": 0 } } } } };
const schema36 = { "properties": { "invalidation": { "enum": ["ttl", "event", "versioned", "none", "immutable"] }, "failureMode": { "enum": ["bypass", "fail-closed"] } } };
const schema37 = { "properties": { "overflow": { "enum": ["reject", "drop-oldest", "drop-newest"] } } };
const schema39 = { "properties": { "mode": { "enum": ["none", "sync", "async"] }, "role": { "enum": ["primary", "replica", "multi-writer"] } } };
const schema40 = { "properties": { "tls": { "type": "boolean" }, "authRequired": { "type": "boolean" }, "durable": { "type": "boolean" }, "idempotent": { "type": "boolean" }, "metrics": { "type": "boolean" }, "logs": { "type": "boolean" }, "traces": { "type": "boolean" }, "alerts": { "type": "boolean" }, "consistency": { "type": "string", "enum": ["strong", "eventual", "not-applicable"] }, "staleToleranceMs": { "type": "number", "minimum": 0 } } };
const func5 = Object.prototype.hasOwnProperty;
function validate22(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.profileId === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "profileId" }, message: "must have required property 'profileId'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.replicas === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "replicas" }, message: "must have required property 'replicas'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.placements === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "placements" }, message: "must have required property 'placements'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.policy === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "policy" }, message: "must have required property 'policy'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func5.call(schema33.properties, key0)) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.profileId !== void 0) {
      let data0 = data.profileId;
      if (typeof data0 === "string") {
        if (!pattern4.test(data0)) {
          const err5 = { instancePath: instancePath + "/profileId", schemaPath: "#/properties/profileId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = { instancePath: instancePath + "/profileId", schemaPath: "#/properties/profileId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.replicas !== void 0) {
      let data1 = data.replicas;
      if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)))) {
        const err7 = { instancePath: instancePath + "/replicas", schemaPath: "#/properties/replicas/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (typeof data1 == "number") {
        if (data1 > 100 || isNaN(data1)) {
          const err8 = { instancePath: instancePath + "/replicas", schemaPath: "#/properties/replicas/maximum", keyword: "maximum", params: { comparison: "<=", limit: 100 }, message: "must be <= 100" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data1 < 1 || isNaN(data1)) {
          const err9 = { instancePath: instancePath + "/replicas", schemaPath: "#/properties/replicas/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      }
    }
    if (data.placements !== void 0) {
      let data2 = data.placements;
      if (Array.isArray(data2)) {
        if (data2.length > 20) {
          const err10 = { instancePath: instancePath + "/placements", schemaPath: "#/properties/placements/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.region === void 0) {
              const err11 = { instancePath: instancePath + "/placements/" + i0, schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "region" }, message: "must have required property 'region'" };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (data3.zone === void 0) {
              const err12 = { instancePath: instancePath + "/placements/" + i0, schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "zone" }, message: "must have required property 'zone'" };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data3.count === void 0) {
              const err13 = { instancePath: instancePath + "/placements/" + i0, schemaPath: "#/$defs/placement/required", keyword: "required", params: { missingProperty: "count" }, message: "must have required property 'count'" };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            for (const key1 in data3) {
              if (!(key1 === "region" || key1 === "zone" || key1 === "count")) {
                const err14 = { instancePath: instancePath + "/placements/" + i0, schemaPath: "#/$defs/placement/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data3.region !== void 0) {
              let data4 = data3.region;
              if (typeof data4 === "string") {
                if (!pattern4.test(data4)) {
                  const err15 = { instancePath: instancePath + "/placements/" + i0 + "/region", schemaPath: "#/$defs/placement/properties/region/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              } else {
                const err16 = { instancePath: instancePath + "/placements/" + i0 + "/region", schemaPath: "#/$defs/placement/properties/region/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
            if (data3.zone !== void 0) {
              let data5 = data3.zone;
              if (typeof data5 === "string") {
                if (!pattern4.test(data5)) {
                  const err17 = { instancePath: instancePath + "/placements/" + i0 + "/zone", schemaPath: "#/$defs/placement/properties/zone/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err17];
                  } else {
                    vErrors.push(err17);
                  }
                  errors++;
                }
              } else {
                const err18 = { instancePath: instancePath + "/placements/" + i0 + "/zone", schemaPath: "#/$defs/placement/properties/zone/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data3.count !== void 0) {
              let data6 = data3.count;
              if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)))) {
                const err19 = { instancePath: instancePath + "/placements/" + i0 + "/count", schemaPath: "#/$defs/placement/properties/count/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
              if (typeof data6 == "number") {
                if (data6 > 100 || isNaN(data6)) {
                  const err20 = { instancePath: instancePath + "/placements/" + i0 + "/count", schemaPath: "#/$defs/placement/properties/count/maximum", keyword: "maximum", params: { comparison: "<=", limit: 100 }, message: "must be <= 100" };
                  if (vErrors === null) {
                    vErrors = [err20];
                  } else {
                    vErrors.push(err20);
                  }
                  errors++;
                }
                if (data6 < 1 || isNaN(data6)) {
                  const err21 = { instancePath: instancePath + "/placements/" + i0 + "/count", schemaPath: "#/$defs/placement/properties/count/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
                  if (vErrors === null) {
                    vErrors = [err21];
                  } else {
                    vErrors.push(err21);
                  }
                  errors++;
                }
              }
            }
          } else {
            const err22 = { instancePath: instancePath + "/placements/" + i0, schemaPath: "#/$defs/placement/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
      } else {
        const err23 = { instancePath: instancePath + "/placements", schemaPath: "#/properties/placements/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.overrides !== void 0) {
      let data7 = data.overrides;
      if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
        for (const key2 in data7) {
          if (!(key2 === "capacityPerInstance" || key2 === "baseLatencyMs" || key2 === "baseP95Ms" || key2 === "maxQueuePenaltyMs" || key2 === "memoryMiB" || key2 === "bandwidthBytesPerSec" || key2 === "connectionCapacity")) {
            const err24 = { instancePath: instancePath + "/overrides", schemaPath: "#/$defs/override/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
        if (data7.capacityPerInstance !== void 0) {
          let data8 = data7.capacityPerInstance;
          if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
            for (const key3 in data8) {
              if (!func5.call(schema35.properties.capacityPerInstance.properties, key3)) {
                const err25 = { instancePath: instancePath + "/overrides/capacityPerInstance", schemaPath: "#/$defs/override/properties/capacityPerInstance/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
            }
            if (data8.compute !== void 0) {
              let data9 = data8.compute;
              if (typeof data9 == "number") {
                if (data9 < 0 || isNaN(data9)) {
                  const err26 = { instancePath: instancePath + "/overrides/capacityPerInstance/compute", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/compute/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
              } else {
                const err27 = { instancePath: instancePath + "/overrides/capacityPerInstance/compute", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/compute/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
            if (data8.read !== void 0) {
              let data10 = data8.read;
              if (typeof data10 == "number") {
                if (data10 < 0 || isNaN(data10)) {
                  const err28 = { instancePath: instancePath + "/overrides/capacityPerInstance/read", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/read/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err28];
                  } else {
                    vErrors.push(err28);
                  }
                  errors++;
                }
              } else {
                const err29 = { instancePath: instancePath + "/overrides/capacityPerInstance/read", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/read/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data8.write !== void 0) {
              let data11 = data8.write;
              if (typeof data11 == "number") {
                if (data11 < 0 || isNaN(data11)) {
                  const err30 = { instancePath: instancePath + "/overrides/capacityPerInstance/write", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/write/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err30];
                  } else {
                    vErrors.push(err30);
                  }
                  errors++;
                }
              } else {
                const err31 = { instancePath: instancePath + "/overrides/capacityPerInstance/write", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/write/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err31];
                } else {
                  vErrors.push(err31);
                }
                errors++;
              }
            }
            if (data8.message !== void 0) {
              let data12 = data8.message;
              if (typeof data12 == "number") {
                if (data12 < 0 || isNaN(data12)) {
                  const err32 = { instancePath: instancePath + "/overrides/capacityPerInstance/message", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/message/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err32];
                  } else {
                    vErrors.push(err32);
                  }
                  errors++;
                }
              } else {
                const err33 = { instancePath: instancePath + "/overrides/capacityPerInstance/message", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/message/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err33];
                } else {
                  vErrors.push(err33);
                }
                errors++;
              }
            }
            if (data8.job !== void 0) {
              let data13 = data8.job;
              if (typeof data13 == "number") {
                if (data13 < 0 || isNaN(data13)) {
                  const err34 = { instancePath: instancePath + "/overrides/capacityPerInstance/job", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/job/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
              } else {
                const err35 = { instancePath: instancePath + "/overrides/capacityPerInstance/job", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/job/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err35];
                } else {
                  vErrors.push(err35);
                }
                errors++;
              }
            }
            if (data8.lookup !== void 0) {
              let data14 = data8.lookup;
              if (typeof data14 == "number") {
                if (data14 < 0 || isNaN(data14)) {
                  const err36 = { instancePath: instancePath + "/overrides/capacityPerInstance/lookup", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/lookup/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err36];
                  } else {
                    vErrors.push(err36);
                  }
                  errors++;
                }
              } else {
                const err37 = { instancePath: instancePath + "/overrides/capacityPerInstance/lookup", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/lookup/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err37];
                } else {
                  vErrors.push(err37);
                }
                errors++;
              }
            }
            if (data8.transfer !== void 0) {
              let data15 = data8.transfer;
              if (typeof data15 == "number") {
                if (data15 < 0 || isNaN(data15)) {
                  const err38 = { instancePath: instancePath + "/overrides/capacityPerInstance/transfer", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/transfer/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err38];
                  } else {
                    vErrors.push(err38);
                  }
                  errors++;
                }
              } else {
                const err39 = { instancePath: instancePath + "/overrides/capacityPerInstance/transfer", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/transfer/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
            }
            if (data8.resolve !== void 0) {
              let data16 = data8.resolve;
              if (typeof data16 == "number") {
                if (data16 < 0 || isNaN(data16)) {
                  const err40 = { instancePath: instancePath + "/overrides/capacityPerInstance/resolve", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/resolve/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err40];
                  } else {
                    vErrors.push(err40);
                  }
                  errors++;
                }
              } else {
                const err41 = { instancePath: instancePath + "/overrides/capacityPerInstance/resolve", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/resolve/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err41];
                } else {
                  vErrors.push(err41);
                }
                errors++;
              }
            }
            if (data8.connection !== void 0) {
              let data17 = data8.connection;
              if (typeof data17 == "number") {
                if (data17 < 0 || isNaN(data17)) {
                  const err42 = { instancePath: instancePath + "/overrides/capacityPerInstance/connection", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/connection/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err42];
                  } else {
                    vErrors.push(err42);
                  }
                  errors++;
                }
              } else {
                const err43 = { instancePath: instancePath + "/overrides/capacityPerInstance/connection", schemaPath: "#/$defs/override/properties/capacityPerInstance/properties/connection/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err43];
                } else {
                  vErrors.push(err43);
                }
                errors++;
              }
            }
          } else {
            const err44 = { instancePath: instancePath + "/overrides/capacityPerInstance", schemaPath: "#/$defs/override/properties/capacityPerInstance/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err44];
            } else {
              vErrors.push(err44);
            }
            errors++;
          }
        }
        if (data7.baseLatencyMs !== void 0) {
          let data18 = data7.baseLatencyMs;
          if (typeof data18 == "number") {
            if (data18 < 0 || isNaN(data18)) {
              const err45 = { instancePath: instancePath + "/overrides/baseLatencyMs", schemaPath: "#/$defs/override/properties/baseLatencyMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err45];
              } else {
                vErrors.push(err45);
              }
              errors++;
            }
          } else {
            const err46 = { instancePath: instancePath + "/overrides/baseLatencyMs", schemaPath: "#/$defs/override/properties/baseLatencyMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err46];
            } else {
              vErrors.push(err46);
            }
            errors++;
          }
        }
        if (data7.baseP95Ms !== void 0) {
          let data19 = data7.baseP95Ms;
          if (typeof data19 == "number") {
            if (data19 < 0 || isNaN(data19)) {
              const err47 = { instancePath: instancePath + "/overrides/baseP95Ms", schemaPath: "#/$defs/override/properties/baseP95Ms/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err47];
              } else {
                vErrors.push(err47);
              }
              errors++;
            }
          } else {
            const err48 = { instancePath: instancePath + "/overrides/baseP95Ms", schemaPath: "#/$defs/override/properties/baseP95Ms/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err48];
            } else {
              vErrors.push(err48);
            }
            errors++;
          }
        }
        if (data7.maxQueuePenaltyMs !== void 0) {
          let data20 = data7.maxQueuePenaltyMs;
          if (typeof data20 == "number") {
            if (data20 < 0 || isNaN(data20)) {
              const err49 = { instancePath: instancePath + "/overrides/maxQueuePenaltyMs", schemaPath: "#/$defs/override/properties/maxQueuePenaltyMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err49];
              } else {
                vErrors.push(err49);
              }
              errors++;
            }
          } else {
            const err50 = { instancePath: instancePath + "/overrides/maxQueuePenaltyMs", schemaPath: "#/$defs/override/properties/maxQueuePenaltyMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err50];
            } else {
              vErrors.push(err50);
            }
            errors++;
          }
        }
        if (data7.memoryMiB !== void 0) {
          let data21 = data7.memoryMiB;
          if (typeof data21 == "number") {
            if (data21 < 0 || isNaN(data21)) {
              const err51 = { instancePath: instancePath + "/overrides/memoryMiB", schemaPath: "#/$defs/override/properties/memoryMiB/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err51];
              } else {
                vErrors.push(err51);
              }
              errors++;
            }
          } else {
            const err52 = { instancePath: instancePath + "/overrides/memoryMiB", schemaPath: "#/$defs/override/properties/memoryMiB/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err52];
            } else {
              vErrors.push(err52);
            }
            errors++;
          }
        }
        if (data7.bandwidthBytesPerSec !== void 0) {
          let data22 = data7.bandwidthBytesPerSec;
          if (typeof data22 == "number") {
            if (data22 < 0 || isNaN(data22)) {
              const err53 = { instancePath: instancePath + "/overrides/bandwidthBytesPerSec", schemaPath: "#/$defs/override/properties/bandwidthBytesPerSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err53];
              } else {
                vErrors.push(err53);
              }
              errors++;
            }
          } else {
            const err54 = { instancePath: instancePath + "/overrides/bandwidthBytesPerSec", schemaPath: "#/$defs/override/properties/bandwidthBytesPerSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err54];
            } else {
              vErrors.push(err54);
            }
            errors++;
          }
        }
        if (data7.connectionCapacity !== void 0) {
          let data23 = data7.connectionCapacity;
          if (typeof data23 == "number") {
            if (data23 < 0 || isNaN(data23)) {
              const err55 = { instancePath: instancePath + "/overrides/connectionCapacity", schemaPath: "#/$defs/override/properties/connectionCapacity/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err55];
              } else {
                vErrors.push(err55);
              }
              errors++;
            }
          } else {
            const err56 = { instancePath: instancePath + "/overrides/connectionCapacity", schemaPath: "#/$defs/override/properties/connectionCapacity/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err56];
            } else {
              vErrors.push(err56);
            }
            errors++;
          }
        }
      } else {
        const err57 = { instancePath: instancePath + "/overrides", schemaPath: "#/$defs/override/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err57];
        } else {
          vErrors.push(err57);
        }
        errors++;
      }
    }
    if (data.cache !== void 0) {
      let data24 = data.cache;
      if (data24 && typeof data24 == "object" && !Array.isArray(data24)) {
        if (data24.hitRate === void 0) {
          const err58 = { instancePath: instancePath + "/cache", schemaPath: "#/$defs/cache/required", keyword: "required", params: { missingProperty: "hitRate" }, message: "must have required property 'hitRate'" };
          if (vErrors === null) {
            vErrors = [err58];
          } else {
            vErrors.push(err58);
          }
          errors++;
        }
        if (data24.invalidation === void 0) {
          const err59 = { instancePath: instancePath + "/cache", schemaPath: "#/$defs/cache/required", keyword: "required", params: { missingProperty: "invalidation" }, message: "must have required property 'invalidation'" };
          if (vErrors === null) {
            vErrors = [err59];
          } else {
            vErrors.push(err59);
          }
          errors++;
        }
        if (data24.failureMode === void 0) {
          const err60 = { instancePath: instancePath + "/cache", schemaPath: "#/$defs/cache/required", keyword: "required", params: { missingProperty: "failureMode" }, message: "must have required property 'failureMode'" };
          if (vErrors === null) {
            vErrors = [err60];
          } else {
            vErrors.push(err60);
          }
          errors++;
        }
        for (const key4 in data24) {
          if (!(key4 === "hitRate" || key4 === "invalidation" || key4 === "ttlSec" || key4 === "failureMode" || key4 === "workingSetMiB" || key4 === "coalescing" || key4 === "warmupSec")) {
            const err61 = { instancePath: instancePath + "/cache", schemaPath: "#/$defs/cache/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err61];
            } else {
              vErrors.push(err61);
            }
            errors++;
          }
        }
        if (data24.hitRate !== void 0) {
          let data25 = data24.hitRate;
          if (typeof data25 == "number") {
            if (data25 > 1 || isNaN(data25)) {
              const err62 = { instancePath: instancePath + "/cache/hitRate", schemaPath: "#/$defs/cache/properties/hitRate/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1 }, message: "must be <= 1" };
              if (vErrors === null) {
                vErrors = [err62];
              } else {
                vErrors.push(err62);
              }
              errors++;
            }
            if (data25 < 0 || isNaN(data25)) {
              const err63 = { instancePath: instancePath + "/cache/hitRate", schemaPath: "#/$defs/cache/properties/hitRate/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err63];
              } else {
                vErrors.push(err63);
              }
              errors++;
            }
          } else {
            const err64 = { instancePath: instancePath + "/cache/hitRate", schemaPath: "#/$defs/cache/properties/hitRate/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err64];
            } else {
              vErrors.push(err64);
            }
            errors++;
          }
        }
        if (data24.invalidation !== void 0) {
          let data26 = data24.invalidation;
          if (typeof data26 !== "string") {
            const err65 = { instancePath: instancePath + "/cache/invalidation", schemaPath: "#/$defs/cache/properties/invalidation/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err65];
            } else {
              vErrors.push(err65);
            }
            errors++;
          }
          if (!(data26 === "ttl" || data26 === "event" || data26 === "versioned" || data26 === "none" || data26 === "immutable")) {
            const err66 = { instancePath: instancePath + "/cache/invalidation", schemaPath: "#/$defs/cache/properties/invalidation/enum", keyword: "enum", params: { allowedValues: schema36.properties.invalidation.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err66];
            } else {
              vErrors.push(err66);
            }
            errors++;
          }
        }
        if (data24.ttlSec !== void 0) {
          let data27 = data24.ttlSec;
          if (typeof data27 == "number") {
            if (data27 < 0 || isNaN(data27)) {
              const err67 = { instancePath: instancePath + "/cache/ttlSec", schemaPath: "#/$defs/cache/properties/ttlSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err67];
              } else {
                vErrors.push(err67);
              }
              errors++;
            }
          } else {
            const err68 = { instancePath: instancePath + "/cache/ttlSec", schemaPath: "#/$defs/cache/properties/ttlSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err68];
            } else {
              vErrors.push(err68);
            }
            errors++;
          }
        }
        if (data24.failureMode !== void 0) {
          let data28 = data24.failureMode;
          if (typeof data28 !== "string") {
            const err69 = { instancePath: instancePath + "/cache/failureMode", schemaPath: "#/$defs/cache/properties/failureMode/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err69];
            } else {
              vErrors.push(err69);
            }
            errors++;
          }
          if (!(data28 === "bypass" || data28 === "fail-closed")) {
            const err70 = { instancePath: instancePath + "/cache/failureMode", schemaPath: "#/$defs/cache/properties/failureMode/enum", keyword: "enum", params: { allowedValues: schema36.properties.failureMode.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err70];
            } else {
              vErrors.push(err70);
            }
            errors++;
          }
        }
        if (data24.workingSetMiB !== void 0) {
          let data29 = data24.workingSetMiB;
          if (typeof data29 == "number") {
            if (data29 < 0 || isNaN(data29)) {
              const err71 = { instancePath: instancePath + "/cache/workingSetMiB", schemaPath: "#/$defs/cache/properties/workingSetMiB/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err71];
              } else {
                vErrors.push(err71);
              }
              errors++;
            }
          } else {
            const err72 = { instancePath: instancePath + "/cache/workingSetMiB", schemaPath: "#/$defs/cache/properties/workingSetMiB/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err72];
            } else {
              vErrors.push(err72);
            }
            errors++;
          }
        }
        if (data24.coalescing !== void 0) {
          if (typeof data24.coalescing !== "boolean") {
            const err73 = { instancePath: instancePath + "/cache/coalescing", schemaPath: "#/$defs/cache/properties/coalescing/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err73];
            } else {
              vErrors.push(err73);
            }
            errors++;
          }
        }
        if (data24.warmupSec !== void 0) {
          let data31 = data24.warmupSec;
          if (typeof data31 == "number") {
            if (data31 < 0 || isNaN(data31)) {
              const err74 = { instancePath: instancePath + "/cache/warmupSec", schemaPath: "#/$defs/cache/properties/warmupSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err74];
              } else {
                vErrors.push(err74);
              }
              errors++;
            }
          } else {
            const err75 = { instancePath: instancePath + "/cache/warmupSec", schemaPath: "#/$defs/cache/properties/warmupSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err75];
            } else {
              vErrors.push(err75);
            }
            errors++;
          }
        }
      } else {
        const err76 = { instancePath: instancePath + "/cache", schemaPath: "#/$defs/cache/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err76];
        } else {
          vErrors.push(err76);
        }
        errors++;
      }
    }
    if (data.queue !== void 0) {
      let data32 = data.queue;
      if (data32 && typeof data32 == "object" && !Array.isArray(data32)) {
        if (data32.durable === void 0) {
          const err77 = { instancePath: instancePath + "/queue", schemaPath: "#/$defs/queue/required", keyword: "required", params: { missingProperty: "durable" }, message: "must have required property 'durable'" };
          if (vErrors === null) {
            vErrors = [err77];
          } else {
            vErrors.push(err77);
          }
          errors++;
        }
        if (data32.overflow === void 0) {
          const err78 = { instancePath: instancePath + "/queue", schemaPath: "#/$defs/queue/required", keyword: "required", params: { missingProperty: "overflow" }, message: "must have required property 'overflow'" };
          if (vErrors === null) {
            vErrors = [err78];
          } else {
            vErrors.push(err78);
          }
          errors++;
        }
        for (const key5 in data32) {
          if (!(key5 === "durable" || key5 === "maxDepth" || key5 === "ttlSec" || key5 === "overflow" || key5 === "dlq")) {
            const err79 = { instancePath: instancePath + "/queue", schemaPath: "#/$defs/queue/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err79];
            } else {
              vErrors.push(err79);
            }
            errors++;
          }
        }
        if (data32.durable !== void 0) {
          if (typeof data32.durable !== "boolean") {
            const err80 = { instancePath: instancePath + "/queue/durable", schemaPath: "#/$defs/queue/properties/durable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err80];
            } else {
              vErrors.push(err80);
            }
            errors++;
          }
        }
        if (data32.maxDepth !== void 0) {
          let data34 = data32.maxDepth;
          if (!(typeof data34 == "number" && (!(data34 % 1) && !isNaN(data34)))) {
            const err81 = { instancePath: instancePath + "/queue/maxDepth", schemaPath: "#/$defs/queue/properties/maxDepth/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
              vErrors = [err81];
            } else {
              vErrors.push(err81);
            }
            errors++;
          }
          if (typeof data34 == "number") {
            if (data34 < 1 || isNaN(data34)) {
              const err82 = { instancePath: instancePath + "/queue/maxDepth", schemaPath: "#/$defs/queue/properties/maxDepth/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
              if (vErrors === null) {
                vErrors = [err82];
              } else {
                vErrors.push(err82);
              }
              errors++;
            }
          }
        }
        if (data32.ttlSec !== void 0) {
          let data35 = data32.ttlSec;
          if (typeof data35 == "number") {
            if (data35 < 0 || isNaN(data35)) {
              const err83 = { instancePath: instancePath + "/queue/ttlSec", schemaPath: "#/$defs/queue/properties/ttlSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err83];
              } else {
                vErrors.push(err83);
              }
              errors++;
            }
          } else {
            const err84 = { instancePath: instancePath + "/queue/ttlSec", schemaPath: "#/$defs/queue/properties/ttlSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err84];
            } else {
              vErrors.push(err84);
            }
            errors++;
          }
        }
        if (data32.overflow !== void 0) {
          let data36 = data32.overflow;
          if (typeof data36 !== "string") {
            const err85 = { instancePath: instancePath + "/queue/overflow", schemaPath: "#/$defs/queue/properties/overflow/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err85];
            } else {
              vErrors.push(err85);
            }
            errors++;
          }
          if (!(data36 === "reject" || data36 === "drop-oldest" || data36 === "drop-newest")) {
            const err86 = { instancePath: instancePath + "/queue/overflow", schemaPath: "#/$defs/queue/properties/overflow/enum", keyword: "enum", params: { allowedValues: schema37.properties.overflow.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err86];
            } else {
              vErrors.push(err86);
            }
            errors++;
          }
        }
        if (data32.dlq !== void 0) {
          if (typeof data32.dlq !== "boolean") {
            const err87 = { instancePath: instancePath + "/queue/dlq", schemaPath: "#/$defs/queue/properties/dlq/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err87];
            } else {
              vErrors.push(err87);
            }
            errors++;
          }
        }
      } else {
        const err88 = { instancePath: instancePath + "/queue", schemaPath: "#/$defs/queue/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err88];
        } else {
          vErrors.push(err88);
        }
        errors++;
      }
    }
    if (data.storage !== void 0) {
      let data38 = data.storage;
      if (data38 && typeof data38 == "object" && !Array.isArray(data38)) {
        for (const key6 in data38) {
          if (!(key6 === "recordBytes" || key6 === "initialRecords" || key6 === "retentionDays" || key6 === "replicationFactor" || key6 === "indexOverheadFactor")) {
            const err89 = { instancePath: instancePath + "/storage", schemaPath: "#/$defs/storage/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err89];
            } else {
              vErrors.push(err89);
            }
            errors++;
          }
        }
        if (data38.recordBytes !== void 0) {
          let data39 = data38.recordBytes;
          if (typeof data39 == "number") {
            if (data39 < 0 || isNaN(data39)) {
              const err90 = { instancePath: instancePath + "/storage/recordBytes", schemaPath: "#/$defs/storage/properties/recordBytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err90];
              } else {
                vErrors.push(err90);
              }
              errors++;
            }
          } else {
            const err91 = { instancePath: instancePath + "/storage/recordBytes", schemaPath: "#/$defs/storage/properties/recordBytes/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err91];
            } else {
              vErrors.push(err91);
            }
            errors++;
          }
        }
        if (data38.initialRecords !== void 0) {
          let data40 = data38.initialRecords;
          if (typeof data40 == "number") {
            if (data40 < 0 || isNaN(data40)) {
              const err92 = { instancePath: instancePath + "/storage/initialRecords", schemaPath: "#/$defs/storage/properties/initialRecords/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err92];
              } else {
                vErrors.push(err92);
              }
              errors++;
            }
          } else {
            const err93 = { instancePath: instancePath + "/storage/initialRecords", schemaPath: "#/$defs/storage/properties/initialRecords/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err93];
            } else {
              vErrors.push(err93);
            }
            errors++;
          }
        }
        if (data38.retentionDays !== void 0) {
          let data41 = data38.retentionDays;
          if (typeof data41 == "number") {
            if (data41 < 0 || isNaN(data41)) {
              const err94 = { instancePath: instancePath + "/storage/retentionDays", schemaPath: "#/$defs/storage/properties/retentionDays/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err94];
              } else {
                vErrors.push(err94);
              }
              errors++;
            }
          } else {
            const err95 = { instancePath: instancePath + "/storage/retentionDays", schemaPath: "#/$defs/storage/properties/retentionDays/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err95];
            } else {
              vErrors.push(err95);
            }
            errors++;
          }
        }
        if (data38.replicationFactor !== void 0) {
          let data42 = data38.replicationFactor;
          if (!(typeof data42 == "number" && (!(data42 % 1) && !isNaN(data42)))) {
            const err96 = { instancePath: instancePath + "/storage/replicationFactor", schemaPath: "#/$defs/storage/properties/replicationFactor/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
              vErrors = [err96];
            } else {
              vErrors.push(err96);
            }
            errors++;
          }
          if (typeof data42 == "number") {
            if (data42 > 100 || isNaN(data42)) {
              const err97 = { instancePath: instancePath + "/storage/replicationFactor", schemaPath: "#/$defs/storage/properties/replicationFactor/maximum", keyword: "maximum", params: { comparison: "<=", limit: 100 }, message: "must be <= 100" };
              if (vErrors === null) {
                vErrors = [err97];
              } else {
                vErrors.push(err97);
              }
              errors++;
            }
            if (data42 < 1 || isNaN(data42)) {
              const err98 = { instancePath: instancePath + "/storage/replicationFactor", schemaPath: "#/$defs/storage/properties/replicationFactor/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
              if (vErrors === null) {
                vErrors = [err98];
              } else {
                vErrors.push(err98);
              }
              errors++;
            }
          }
        }
        if (data38.indexOverheadFactor !== void 0) {
          let data43 = data38.indexOverheadFactor;
          if (typeof data43 == "number") {
            if (data43 < 1 || isNaN(data43)) {
              const err99 = { instancePath: instancePath + "/storage/indexOverheadFactor", schemaPath: "#/$defs/storage/properties/indexOverheadFactor/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
              if (vErrors === null) {
                vErrors = [err99];
              } else {
                vErrors.push(err99);
              }
              errors++;
            }
          } else {
            const err100 = { instancePath: instancePath + "/storage/indexOverheadFactor", schemaPath: "#/$defs/storage/properties/indexOverheadFactor/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err100];
            } else {
              vErrors.push(err100);
            }
            errors++;
          }
        }
      } else {
        const err101 = { instancePath: instancePath + "/storage", schemaPath: "#/$defs/storage/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err101];
        } else {
          vErrors.push(err101);
        }
        errors++;
      }
    }
    if (data.replication !== void 0) {
      let data44 = data.replication;
      if (data44 && typeof data44 == "object" && !Array.isArray(data44)) {
        if (data44.mode === void 0) {
          const err102 = { instancePath: instancePath + "/replication", schemaPath: "#/$defs/replication/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          if (vErrors === null) {
            vErrors = [err102];
          } else {
            vErrors.push(err102);
          }
          errors++;
        }
        if (data44.role === void 0) {
          const err103 = { instancePath: instancePath + "/replication", schemaPath: "#/$defs/replication/required", keyword: "required", params: { missingProperty: "role" }, message: "must have required property 'role'" };
          if (vErrors === null) {
            vErrors = [err103];
          } else {
            vErrors.push(err103);
          }
          errors++;
        }
        if (data44.failoverEnabled === void 0) {
          const err104 = { instancePath: instancePath + "/replication", schemaPath: "#/$defs/replication/required", keyword: "required", params: { missingProperty: "failoverEnabled" }, message: "must have required property 'failoverEnabled'" };
          if (vErrors === null) {
            vErrors = [err104];
          } else {
            vErrors.push(err104);
          }
          errors++;
        }
        for (const key7 in data44) {
          if (!(key7 === "mode" || key7 === "role" || key7 === "lagMs" || key7 === "failoverEnabled" || key7 === "failoverDelaySec")) {
            const err105 = { instancePath: instancePath + "/replication", schemaPath: "#/$defs/replication/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key7 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err105];
            } else {
              vErrors.push(err105);
            }
            errors++;
          }
        }
        if (data44.mode !== void 0) {
          let data45 = data44.mode;
          if (typeof data45 !== "string") {
            const err106 = { instancePath: instancePath + "/replication/mode", schemaPath: "#/$defs/replication/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err106];
            } else {
              vErrors.push(err106);
            }
            errors++;
          }
          if (!(data45 === "none" || data45 === "sync" || data45 === "async")) {
            const err107 = { instancePath: instancePath + "/replication/mode", schemaPath: "#/$defs/replication/properties/mode/enum", keyword: "enum", params: { allowedValues: schema39.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err107];
            } else {
              vErrors.push(err107);
            }
            errors++;
          }
        }
        if (data44.role !== void 0) {
          let data46 = data44.role;
          if (typeof data46 !== "string") {
            const err108 = { instancePath: instancePath + "/replication/role", schemaPath: "#/$defs/replication/properties/role/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err108];
            } else {
              vErrors.push(err108);
            }
            errors++;
          }
          if (!(data46 === "primary" || data46 === "replica" || data46 === "multi-writer")) {
            const err109 = { instancePath: instancePath + "/replication/role", schemaPath: "#/$defs/replication/properties/role/enum", keyword: "enum", params: { allowedValues: schema39.properties.role.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err109];
            } else {
              vErrors.push(err109);
            }
            errors++;
          }
        }
        if (data44.lagMs !== void 0) {
          let data47 = data44.lagMs;
          if (typeof data47 == "number") {
            if (data47 < 0 || isNaN(data47)) {
              const err110 = { instancePath: instancePath + "/replication/lagMs", schemaPath: "#/$defs/replication/properties/lagMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err110];
              } else {
                vErrors.push(err110);
              }
              errors++;
            }
          } else {
            const err111 = { instancePath: instancePath + "/replication/lagMs", schemaPath: "#/$defs/replication/properties/lagMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err111];
            } else {
              vErrors.push(err111);
            }
            errors++;
          }
        }
        if (data44.failoverEnabled !== void 0) {
          if (typeof data44.failoverEnabled !== "boolean") {
            const err112 = { instancePath: instancePath + "/replication/failoverEnabled", schemaPath: "#/$defs/replication/properties/failoverEnabled/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err112];
            } else {
              vErrors.push(err112);
            }
            errors++;
          }
        }
        if (data44.failoverDelaySec !== void 0) {
          let data49 = data44.failoverDelaySec;
          if (typeof data49 == "number") {
            if (data49 < 0 || isNaN(data49)) {
              const err113 = { instancePath: instancePath + "/replication/failoverDelaySec", schemaPath: "#/$defs/replication/properties/failoverDelaySec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err113];
              } else {
                vErrors.push(err113);
              }
              errors++;
            }
          } else {
            const err114 = { instancePath: instancePath + "/replication/failoverDelaySec", schemaPath: "#/$defs/replication/properties/failoverDelaySec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err114];
            } else {
              vErrors.push(err114);
            }
            errors++;
          }
        }
      } else {
        const err115 = { instancePath: instancePath + "/replication", schemaPath: "#/$defs/replication/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err115];
        } else {
          vErrors.push(err115);
        }
        errors++;
      }
    }
    if (data.policy !== void 0) {
      let data50 = data.policy;
      if (data50 && typeof data50 == "object" && !Array.isArray(data50)) {
        for (const key8 in data50) {
          if (!func5.call(schema40.properties, key8)) {
            const err116 = { instancePath: instancePath + "/policy", schemaPath: "#/$defs/policy/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key8 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err116];
            } else {
              vErrors.push(err116);
            }
            errors++;
          }
        }
        if (data50.tls !== void 0) {
          if (typeof data50.tls !== "boolean") {
            const err117 = { instancePath: instancePath + "/policy/tls", schemaPath: "#/$defs/policy/properties/tls/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err117];
            } else {
              vErrors.push(err117);
            }
            errors++;
          }
        }
        if (data50.authRequired !== void 0) {
          if (typeof data50.authRequired !== "boolean") {
            const err118 = { instancePath: instancePath + "/policy/authRequired", schemaPath: "#/$defs/policy/properties/authRequired/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err118];
            } else {
              vErrors.push(err118);
            }
            errors++;
          }
        }
        if (data50.durable !== void 0) {
          if (typeof data50.durable !== "boolean") {
            const err119 = { instancePath: instancePath + "/policy/durable", schemaPath: "#/$defs/policy/properties/durable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err119];
            } else {
              vErrors.push(err119);
            }
            errors++;
          }
        }
        if (data50.idempotent !== void 0) {
          if (typeof data50.idempotent !== "boolean") {
            const err120 = { instancePath: instancePath + "/policy/idempotent", schemaPath: "#/$defs/policy/properties/idempotent/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err120];
            } else {
              vErrors.push(err120);
            }
            errors++;
          }
        }
        if (data50.metrics !== void 0) {
          if (typeof data50.metrics !== "boolean") {
            const err121 = { instancePath: instancePath + "/policy/metrics", schemaPath: "#/$defs/policy/properties/metrics/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err121];
            } else {
              vErrors.push(err121);
            }
            errors++;
          }
        }
        if (data50.logs !== void 0) {
          if (typeof data50.logs !== "boolean") {
            const err122 = { instancePath: instancePath + "/policy/logs", schemaPath: "#/$defs/policy/properties/logs/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err122];
            } else {
              vErrors.push(err122);
            }
            errors++;
          }
        }
        if (data50.traces !== void 0) {
          if (typeof data50.traces !== "boolean") {
            const err123 = { instancePath: instancePath + "/policy/traces", schemaPath: "#/$defs/policy/properties/traces/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err123];
            } else {
              vErrors.push(err123);
            }
            errors++;
          }
        }
        if (data50.alerts !== void 0) {
          if (typeof data50.alerts !== "boolean") {
            const err124 = { instancePath: instancePath + "/policy/alerts", schemaPath: "#/$defs/policy/properties/alerts/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err124];
            } else {
              vErrors.push(err124);
            }
            errors++;
          }
        }
        if (data50.consistency !== void 0) {
          let data59 = data50.consistency;
          if (typeof data59 !== "string") {
            const err125 = { instancePath: instancePath + "/policy/consistency", schemaPath: "#/$defs/policy/properties/consistency/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err125];
            } else {
              vErrors.push(err125);
            }
            errors++;
          }
          if (!(data59 === "strong" || data59 === "eventual" || data59 === "not-applicable")) {
            const err126 = { instancePath: instancePath + "/policy/consistency", schemaPath: "#/$defs/policy/properties/consistency/enum", keyword: "enum", params: { allowedValues: schema40.properties.consistency.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err126];
            } else {
              vErrors.push(err126);
            }
            errors++;
          }
        }
        if (data50.staleToleranceMs !== void 0) {
          let data60 = data50.staleToleranceMs;
          if (typeof data60 == "number") {
            if (data60 < 0 || isNaN(data60)) {
              const err127 = { instancePath: instancePath + "/policy/staleToleranceMs", schemaPath: "#/$defs/policy/properties/staleToleranceMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err127];
              } else {
                vErrors.push(err127);
              }
              errors++;
            }
          } else {
            const err128 = { instancePath: instancePath + "/policy/staleToleranceMs", schemaPath: "#/$defs/policy/properties/staleToleranceMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err128];
            } else {
              vErrors.push(err128);
            }
            errors++;
          }
        }
      } else {
        const err129 = { instancePath: instancePath + "/policy", schemaPath: "#/$defs/policy/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err129];
        } else {
          vErrors.push(err129);
        }
        errors++;
      }
    }
  } else {
    const err130 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err130];
    } else {
      vErrors.push(err130);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate21(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.componentVersion === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "componentVersion" }, message: "must have required property 'componentVersion'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.name === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.properties === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "properties" }, message: "must have required property 'properties'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "id" || key0 === "type" || key0 === "componentVersion" || key0 === "name" || key0 === "properties")) {
        const err5 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.id !== void 0) {
      let data0 = data.id;
      if (typeof data0 === "string") {
        if (!pattern4.test(data0)) {
          const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      let data1 = data.type;
      if (typeof data1 !== "string") {
        const err8 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if (!(data1 === "client" || data1 === "web-app" || data1 === "mobile-app" || data1 === "api-gateway" || data1 === "load-balancer" || data1 === "backend" || data1 === "microservice" || data1 === "database" || data1 === "sql-database" || data1 === "nosql-database" || data1 === "redis" || data1 === "kafka" || data1 === "queue" || data1 === "worker" || data1 === "cdn" || data1 === "object-storage" || data1 === "search-engine" || data1 === "websocket" || data1 === "dns" || data1 === "authentication-service" || data1 === "notification-service" || data1 === "iot-device" || data1 === "external-system" || data1 === "iot-gateway" || data1 === "mqtt-broker" || data1 === "iot-platform" || data1 === "edge-compute" || data1 === "waf" || data1 === "service-mesh" || data1 === "rate-limiter" || data1 === "container" || data1 === "kubernetes" || data1 === "serverless" || data1 === "vm" || data1 === "scheduler" || data1 === "workflow-engine" || data1 === "stream-processor" || data1 === "batch-processor" || data1 === "ml-service" || data1 === "timeseries-db" || data1 === "graph-db" || data1 === "vector-db" || data1 === "data-warehouse" || data1 === "event-bus" || data1 === "secrets-manager" || data1 === "service-discovery" || data1 === "observability" || data1 === "payment-gateway" || data1 === "third-party-api")) {
        const err9 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: schema32.properties.type.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.componentVersion !== void 0) {
      let data2 = data.componentVersion;
      if (typeof data2 === "string") {
        if (func1(data2) > 120) {
          const err10 = { instancePath: instancePath + "/componentVersion", schemaPath: "#/properties/componentVersion/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (func1(data2) < 1) {
          const err11 = { instancePath: instancePath + "/componentVersion", schemaPath: "#/properties/componentVersion/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/componentVersion", schemaPath: "#/properties/componentVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data3 = data.name;
      if (typeof data3 === "string") {
        if (func1(data3) > 120) {
          const err13 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (func1(data3) < 1) {
          const err14 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.properties !== void 0) {
      if (!validate22(data.properties, { instancePath: instancePath + "/properties", parentData: data, parentDataProperty: "properties", rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err16 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
const schema42 = { "properties": { "mode": { "type": "string", "enum": ["sync", "async"] }, "protocol": { "type": "string", "enum": ["https", "tcp", "sql", "redis", "kafka", "amqp", "websocket", "dns", "internal", "http", "grpc", "graphql", "mqtt", "coap", "sse", "opcua", "modbus", "lorawan", "ble", "smtp"] }, "required": { "type": "boolean" }, "timeoutMs": { "type": "number", "minimum": 0 }, "networkLatencyMs": { "type": "number", "minimum": 0 }, "maxAttempts": { "type": "integer", "minimum": 1, "maximum": 3 }, "backoffMs": { "type": "number", "minimum": 0 }, "retryable": { "type": "boolean" }, "tls": { "type": "boolean" }, "bidirectional": { "type": "boolean" } } };
function validate25(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate25.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.source === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.sourcePort === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sourcePort" }, message: "must have required property 'sourcePort'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.target === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "target" }, message: "must have required property 'target'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.targetPort === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "targetPort" }, message: "must have required property 'targetPort'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.configuration === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "configuration" }, message: "must have required property 'configuration'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "id" || key0 === "source" || key0 === "sourcePort" || key0 === "target" || key0 === "targetPort" || key0 === "configuration")) {
        const err6 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.id !== void 0) {
      let data0 = data.id;
      if (typeof data0 === "string") {
        if (!pattern4.test(data0)) {
          const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.source !== void 0) {
      let data1 = data.source;
      if (typeof data1 === "string") {
        if (!pattern4.test(data1)) {
          const err9 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.sourcePort !== void 0) {
      let data2 = data.sourcePort;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err11 = { instancePath: instancePath + "/sourcePort", schemaPath: "#/properties/sourcePort/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/sourcePort", schemaPath: "#/properties/sourcePort/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.target !== void 0) {
      let data3 = data.target;
      if (typeof data3 === "string") {
        if (!pattern4.test(data3)) {
          const err13 = { instancePath: instancePath + "/target", schemaPath: "#/properties/target/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      } else {
        const err14 = { instancePath: instancePath + "/target", schemaPath: "#/properties/target/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.targetPort !== void 0) {
      let data4 = data.targetPort;
      if (typeof data4 === "string") {
        if (!pattern4.test(data4)) {
          const err15 = { instancePath: instancePath + "/targetPort", schemaPath: "#/properties/targetPort/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      } else {
        const err16 = { instancePath: instancePath + "/targetPort", schemaPath: "#/properties/targetPort/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.configuration !== void 0) {
      let data5 = data.configuration;
      if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
        if (data5.mode === void 0) {
          const err17 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "mode" }, message: "must have required property 'mode'" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data5.protocol === void 0) {
          const err18 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "protocol" }, message: "must have required property 'protocol'" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data5.required === void 0) {
          const err19 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "required" }, message: "must have required property 'required'" };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
        if (data5.timeoutMs === void 0) {
          const err20 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "timeoutMs" }, message: "must have required property 'timeoutMs'" };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        if (data5.networkLatencyMs === void 0) {
          const err21 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "networkLatencyMs" }, message: "must have required property 'networkLatencyMs'" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
        if (data5.maxAttempts === void 0) {
          const err22 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "maxAttempts" }, message: "must have required property 'maxAttempts'" };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
          }
          errors++;
        }
        if (data5.backoffMs === void 0) {
          const err23 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "backoffMs" }, message: "must have required property 'backoffMs'" };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data5.retryable === void 0) {
          const err24 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "retryable" }, message: "must have required property 'retryable'" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data5.tls === void 0) {
          const err25 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/required", keyword: "required", params: { missingProperty: "tls" }, message: "must have required property 'tls'" };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
        for (const key1 in data5) {
          if (!func5.call(schema42.properties, key1)) {
            const err26 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
        if (data5.mode !== void 0) {
          let data6 = data5.mode;
          if (typeof data6 !== "string") {
            const err27 = { instancePath: instancePath + "/configuration/mode", schemaPath: "#/$defs/edgeConfig/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
          if (!(data6 === "sync" || data6 === "async")) {
            const err28 = { instancePath: instancePath + "/configuration/mode", schemaPath: "#/$defs/edgeConfig/properties/mode/enum", keyword: "enum", params: { allowedValues: schema42.properties.mode.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err28];
            } else {
              vErrors.push(err28);
            }
            errors++;
          }
        }
        if (data5.protocol !== void 0) {
          let data7 = data5.protocol;
          if (typeof data7 !== "string") {
            const err29 = { instancePath: instancePath + "/configuration/protocol", schemaPath: "#/$defs/edgeConfig/properties/protocol/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
          if (!(data7 === "https" || data7 === "tcp" || data7 === "sql" || data7 === "redis" || data7 === "kafka" || data7 === "amqp" || data7 === "websocket" || data7 === "dns" || data7 === "internal" || data7 === "http" || data7 === "grpc" || data7 === "graphql" || data7 === "mqtt" || data7 === "coap" || data7 === "sse" || data7 === "opcua" || data7 === "modbus" || data7 === "lorawan" || data7 === "ble" || data7 === "smtp")) {
            const err30 = { instancePath: instancePath + "/configuration/protocol", schemaPath: "#/$defs/edgeConfig/properties/protocol/enum", keyword: "enum", params: { allowedValues: schema42.properties.protocol.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        if (data5.required !== void 0) {
          if (typeof data5.required !== "boolean") {
            const err31 = { instancePath: instancePath + "/configuration/required", schemaPath: "#/$defs/edgeConfig/properties/required/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
        if (data5.timeoutMs !== void 0) {
          let data9 = data5.timeoutMs;
          if (typeof data9 == "number") {
            if (data9 < 0 || isNaN(data9)) {
              const err32 = { instancePath: instancePath + "/configuration/timeoutMs", schemaPath: "#/$defs/edgeConfig/properties/timeoutMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err32];
              } else {
                vErrors.push(err32);
              }
              errors++;
            }
          } else {
            const err33 = { instancePath: instancePath + "/configuration/timeoutMs", schemaPath: "#/$defs/edgeConfig/properties/timeoutMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
        if (data5.networkLatencyMs !== void 0) {
          let data10 = data5.networkLatencyMs;
          if (typeof data10 == "number") {
            if (data10 < 0 || isNaN(data10)) {
              const err34 = { instancePath: instancePath + "/configuration/networkLatencyMs", schemaPath: "#/$defs/edgeConfig/properties/networkLatencyMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err34];
              } else {
                vErrors.push(err34);
              }
              errors++;
            }
          } else {
            const err35 = { instancePath: instancePath + "/configuration/networkLatencyMs", schemaPath: "#/$defs/edgeConfig/properties/networkLatencyMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err35];
            } else {
              vErrors.push(err35);
            }
            errors++;
          }
        }
        if (data5.maxAttempts !== void 0) {
          let data11 = data5.maxAttempts;
          if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)))) {
            const err36 = { instancePath: instancePath + "/configuration/maxAttempts", schemaPath: "#/$defs/edgeConfig/properties/maxAttempts/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
              vErrors = [err36];
            } else {
              vErrors.push(err36);
            }
            errors++;
          }
          if (typeof data11 == "number") {
            if (data11 > 3 || isNaN(data11)) {
              const err37 = { instancePath: instancePath + "/configuration/maxAttempts", schemaPath: "#/$defs/edgeConfig/properties/maxAttempts/maximum", keyword: "maximum", params: { comparison: "<=", limit: 3 }, message: "must be <= 3" };
              if (vErrors === null) {
                vErrors = [err37];
              } else {
                vErrors.push(err37);
              }
              errors++;
            }
            if (data11 < 1 || isNaN(data11)) {
              const err38 = { instancePath: instancePath + "/configuration/maxAttempts", schemaPath: "#/$defs/edgeConfig/properties/maxAttempts/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
              if (vErrors === null) {
                vErrors = [err38];
              } else {
                vErrors.push(err38);
              }
              errors++;
            }
          }
        }
        if (data5.backoffMs !== void 0) {
          let data12 = data5.backoffMs;
          if (typeof data12 == "number") {
            if (data12 < 0 || isNaN(data12)) {
              const err39 = { instancePath: instancePath + "/configuration/backoffMs", schemaPath: "#/$defs/edgeConfig/properties/backoffMs/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err39];
              } else {
                vErrors.push(err39);
              }
              errors++;
            }
          } else {
            const err40 = { instancePath: instancePath + "/configuration/backoffMs", schemaPath: "#/$defs/edgeConfig/properties/backoffMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err40];
            } else {
              vErrors.push(err40);
            }
            errors++;
          }
        }
        if (data5.retryable !== void 0) {
          if (typeof data5.retryable !== "boolean") {
            const err41 = { instancePath: instancePath + "/configuration/retryable", schemaPath: "#/$defs/edgeConfig/properties/retryable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err41];
            } else {
              vErrors.push(err41);
            }
            errors++;
          }
        }
        if (data5.tls !== void 0) {
          if (typeof data5.tls !== "boolean") {
            const err42 = { instancePath: instancePath + "/configuration/tls", schemaPath: "#/$defs/edgeConfig/properties/tls/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err42];
            } else {
              vErrors.push(err42);
            }
            errors++;
          }
        }
        if (data5.bidirectional !== void 0) {
          if (typeof data5.bidirectional !== "boolean") {
            const err43 = { instancePath: instancePath + "/configuration/bidirectional", schemaPath: "#/$defs/edgeConfig/properties/bidirectional/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err43];
            } else {
              vErrors.push(err43);
            }
            errors++;
          }
        }
      } else {
        const err44 = { instancePath: instancePath + "/configuration", schemaPath: "#/$defs/edgeConfig/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err44];
        } else {
          vErrors.push(err44);
        }
        errors++;
      }
    }
  } else {
    const err45 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err45];
    } else {
      vErrors.push(err45);
    }
    errors++;
  }
  validate25.errors = vErrors;
  return errors === 0;
}
validate25.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
const schema47 = { "properties": { "id": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "nodeId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "parentStepId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "edgeId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, "ordinal": { "type": "integer", "minimum": 0 }, "operationClass": { "type": "string", "enum": ["compute", "read", "write", "message", "job", "lookup", "transfer", "resolve", "connection"] }, "visitsPerRequest": { "type": "number", "minimum": 0 }, "branchShare": { "type": "number", "minimum": 0, "maximum": 1 }, "condition": { "type": "string", "enum": ["always", "cache-hit", "cache-miss"] }, "join": { "type": "string", "enum": ["serial", "parallel-all", "alternative"] }, "required": { "type": "boolean" }, "conditionStepId": { "type": "string", "pattern": "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" } } };
function validate27(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate27.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.workloadId === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "workloadId" }, message: "must have required property 'workloadId'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.ackStepId === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "ackStepId" }, message: "must have required property 'ackStepId'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.steps === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "steps" }, message: "must have required property 'steps'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "id" || key0 === "workloadId" || key0 === "ackStepId" || key0 === "steps")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.id !== void 0) {
      let data0 = data.id;
      if (typeof data0 === "string") {
        if (!pattern4.test(data0)) {
          const err5 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.workloadId !== void 0) {
      let data1 = data.workloadId;
      if (typeof data1 === "string") {
        if (!pattern4.test(data1)) {
          const err7 = { instancePath: instancePath + "/workloadId", schemaPath: "#/properties/workloadId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/workloadId", schemaPath: "#/properties/workloadId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ackStepId !== void 0) {
      let data2 = data.ackStepId;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err9 = { instancePath: instancePath + "/ackStepId", schemaPath: "#/properties/ackStepId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/ackStepId", schemaPath: "#/properties/ackStepId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.steps !== void 0) {
      let data3 = data.steps;
      if (Array.isArray(data3)) {
        if (data3.length > 200) {
          const err11 = { instancePath: instancePath + "/steps", schemaPath: "#/properties/steps/maxItems", keyword: "maxItems", params: { limit: 200 }, message: "must NOT have more than 200 items" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
            if (data4.id === void 0) {
              const err12 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data4.nodeId === void 0) {
              const err13 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "nodeId" }, message: "must have required property 'nodeId'" };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (data4.ordinal === void 0) {
              const err14 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "ordinal" }, message: "must have required property 'ordinal'" };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (data4.operationClass === void 0) {
              const err15 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "operationClass" }, message: "must have required property 'operationClass'" };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data4.visitsPerRequest === void 0) {
              const err16 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "visitsPerRequest" }, message: "must have required property 'visitsPerRequest'" };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data4.branchShare === void 0) {
              const err17 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "branchShare" }, message: "must have required property 'branchShare'" };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
            if (data4.condition === void 0) {
              const err18 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "condition" }, message: "must have required property 'condition'" };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            if (data4.join === void 0) {
              const err19 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "join" }, message: "must have required property 'join'" };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
            if (data4.required === void 0) {
              const err20 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/required", keyword: "required", params: { missingProperty: "required" }, message: "must have required property 'required'" };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
            for (const key1 in data4) {
              if (!func5.call(schema47.properties, key1)) {
                const err21 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err21];
                } else {
                  vErrors.push(err21);
                }
                errors++;
              }
            }
            if (data4.id !== void 0) {
              let data5 = data4.id;
              if (typeof data5 === "string") {
                if (!pattern4.test(data5)) {
                  const err22 = { instancePath: instancePath + "/steps/" + i0 + "/id", schemaPath: "#/$defs/step/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err22];
                  } else {
                    vErrors.push(err22);
                  }
                  errors++;
                }
              } else {
                const err23 = { instancePath: instancePath + "/steps/" + i0 + "/id", schemaPath: "#/$defs/step/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data4.nodeId !== void 0) {
              let data6 = data4.nodeId;
              if (typeof data6 === "string") {
                if (!pattern4.test(data6)) {
                  const err24 = { instancePath: instancePath + "/steps/" + i0 + "/nodeId", schemaPath: "#/$defs/step/properties/nodeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
                  }
                  errors++;
                }
              } else {
                const err25 = { instancePath: instancePath + "/steps/" + i0 + "/nodeId", schemaPath: "#/$defs/step/properties/nodeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
            }
            if (data4.parentStepId !== void 0) {
              let data7 = data4.parentStepId;
              if (typeof data7 === "string") {
                if (!pattern4.test(data7)) {
                  const err26 = { instancePath: instancePath + "/steps/" + i0 + "/parentStepId", schemaPath: "#/$defs/step/properties/parentStepId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
              } else {
                const err27 = { instancePath: instancePath + "/steps/" + i0 + "/parentStepId", schemaPath: "#/$defs/step/properties/parentStepId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
            if (data4.edgeId !== void 0) {
              let data8 = data4.edgeId;
              if (typeof data8 === "string") {
                if (!pattern4.test(data8)) {
                  const err28 = { instancePath: instancePath + "/steps/" + i0 + "/edgeId", schemaPath: "#/$defs/step/properties/edgeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err28];
                  } else {
                    vErrors.push(err28);
                  }
                  errors++;
                }
              } else {
                const err29 = { instancePath: instancePath + "/steps/" + i0 + "/edgeId", schemaPath: "#/$defs/step/properties/edgeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data4.ordinal !== void 0) {
              let data9 = data4.ordinal;
              if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)))) {
                const err30 = { instancePath: instancePath + "/steps/" + i0 + "/ordinal", schemaPath: "#/$defs/step/properties/ordinal/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
              if (typeof data9 == "number") {
                if (data9 < 0 || isNaN(data9)) {
                  const err31 = { instancePath: instancePath + "/steps/" + i0 + "/ordinal", schemaPath: "#/$defs/step/properties/ordinal/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err31];
                  } else {
                    vErrors.push(err31);
                  }
                  errors++;
                }
              }
            }
            if (data4.operationClass !== void 0) {
              let data10 = data4.operationClass;
              if (typeof data10 !== "string") {
                const err32 = { instancePath: instancePath + "/steps/" + i0 + "/operationClass", schemaPath: "#/$defs/step/properties/operationClass/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err32];
                } else {
                  vErrors.push(err32);
                }
                errors++;
              }
              if (!(data10 === "compute" || data10 === "read" || data10 === "write" || data10 === "message" || data10 === "job" || data10 === "lookup" || data10 === "transfer" || data10 === "resolve" || data10 === "connection")) {
                const err33 = { instancePath: instancePath + "/steps/" + i0 + "/operationClass", schemaPath: "#/$defs/step/properties/operationClass/enum", keyword: "enum", params: { allowedValues: schema47.properties.operationClass.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err33];
                } else {
                  vErrors.push(err33);
                }
                errors++;
              }
            }
            if (data4.visitsPerRequest !== void 0) {
              let data11 = data4.visitsPerRequest;
              if (typeof data11 == "number") {
                if (data11 < 0 || isNaN(data11)) {
                  const err34 = { instancePath: instancePath + "/steps/" + i0 + "/visitsPerRequest", schemaPath: "#/$defs/step/properties/visitsPerRequest/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
              } else {
                const err35 = { instancePath: instancePath + "/steps/" + i0 + "/visitsPerRequest", schemaPath: "#/$defs/step/properties/visitsPerRequest/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err35];
                } else {
                  vErrors.push(err35);
                }
                errors++;
              }
            }
            if (data4.branchShare !== void 0) {
              let data12 = data4.branchShare;
              if (typeof data12 == "number") {
                if (data12 > 1 || isNaN(data12)) {
                  const err36 = { instancePath: instancePath + "/steps/" + i0 + "/branchShare", schemaPath: "#/$defs/step/properties/branchShare/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1 }, message: "must be <= 1" };
                  if (vErrors === null) {
                    vErrors = [err36];
                  } else {
                    vErrors.push(err36);
                  }
                  errors++;
                }
                if (data12 < 0 || isNaN(data12)) {
                  const err37 = { instancePath: instancePath + "/steps/" + i0 + "/branchShare", schemaPath: "#/$defs/step/properties/branchShare/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                  if (vErrors === null) {
                    vErrors = [err37];
                  } else {
                    vErrors.push(err37);
                  }
                  errors++;
                }
              } else {
                const err38 = { instancePath: instancePath + "/steps/" + i0 + "/branchShare", schemaPath: "#/$defs/step/properties/branchShare/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err38];
                } else {
                  vErrors.push(err38);
                }
                errors++;
              }
            }
            if (data4.condition !== void 0) {
              let data13 = data4.condition;
              if (typeof data13 !== "string") {
                const err39 = { instancePath: instancePath + "/steps/" + i0 + "/condition", schemaPath: "#/$defs/step/properties/condition/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
              if (!(data13 === "always" || data13 === "cache-hit" || data13 === "cache-miss")) {
                const err40 = { instancePath: instancePath + "/steps/" + i0 + "/condition", schemaPath: "#/$defs/step/properties/condition/enum", keyword: "enum", params: { allowedValues: schema47.properties.condition.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
            }
            if (data4.join !== void 0) {
              let data14 = data4.join;
              if (typeof data14 !== "string") {
                const err41 = { instancePath: instancePath + "/steps/" + i0 + "/join", schemaPath: "#/$defs/step/properties/join/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err41];
                } else {
                  vErrors.push(err41);
                }
                errors++;
              }
              if (!(data14 === "serial" || data14 === "parallel-all" || data14 === "alternative")) {
                const err42 = { instancePath: instancePath + "/steps/" + i0 + "/join", schemaPath: "#/$defs/step/properties/join/enum", keyword: "enum", params: { allowedValues: schema47.properties.join.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err42];
                } else {
                  vErrors.push(err42);
                }
                errors++;
              }
            }
            if (data4.required !== void 0) {
              if (typeof data4.required !== "boolean") {
                const err43 = { instancePath: instancePath + "/steps/" + i0 + "/required", schemaPath: "#/$defs/step/properties/required/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                if (vErrors === null) {
                  vErrors = [err43];
                } else {
                  vErrors.push(err43);
                }
                errors++;
              }
            }
            if (data4.conditionStepId !== void 0) {
              let data16 = data4.conditionStepId;
              if (typeof data16 === "string") {
                if (!pattern4.test(data16)) {
                  const err44 = { instancePath: instancePath + "/steps/" + i0 + "/conditionStepId", schemaPath: "#/$defs/step/properties/conditionStepId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err44];
                  } else {
                    vErrors.push(err44);
                  }
                  errors++;
                }
              } else {
                const err45 = { instancePath: instancePath + "/steps/" + i0 + "/conditionStepId", schemaPath: "#/$defs/step/properties/conditionStepId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err45];
                } else {
                  vErrors.push(err45);
                }
                errors++;
              }
            }
          } else {
            const err46 = { instancePath: instancePath + "/steps/" + i0, schemaPath: "#/$defs/step/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err46];
            } else {
              vErrors.push(err46);
            }
            errors++;
          }
        }
      } else {
        const err47 = { instancePath: instancePath + "/steps", schemaPath: "#/properties/steps/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err47];
        } else {
          vErrors.push(err47);
        }
        errors++;
      }
    }
  } else {
    const err48 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err48];
    } else {
      vErrors.push(err48);
    }
    errors++;
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.schemaVersion === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "schemaVersion" }, message: "must have required property 'schemaVersion'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.nodes === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "nodes" }, message: "must have required property 'nodes'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.edges === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "edges" }, message: "must have required property 'edges'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.metadata === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "metadata" }, message: "must have required property 'metadata'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.traffic === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "traffic" }, message: "must have required property 'traffic'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.dependencies === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "dependencies" }, message: "must have required property 'dependencies'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.configuration === void 0) {
      const err6 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "configuration" }, message: "must have required property 'configuration'" };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.layout === void 0) {
      const err7 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "layout" }, message: "must have required property 'layout'" };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "schemaVersion" || key0 === "nodes" || key0 === "edges" || key0 === "metadata" || key0 === "traffic" || key0 === "dependencies" || key0 === "configuration" || key0 === "layout")) {
        const err8 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.schemaVersion !== void 0) {
      if ("1.0.0" !== data.schemaVersion) {
        const err9 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/const", keyword: "const", params: { allowedValue: "1.0.0" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.nodes !== void 0) {
      let data1 = data.nodes;
      if (Array.isArray(data1)) {
        if (data1.length > 100) {
          const err10 = { instancePath: instancePath + "/nodes", schemaPath: "#/properties/nodes/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (!validate21(data1[i0], { instancePath: instancePath + "/nodes/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err11 = { instancePath: instancePath + "/nodes", schemaPath: "#/properties/nodes/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.edges !== void 0) {
      let data3 = data.edges;
      if (Array.isArray(data3)) {
        if (data3.length > 200) {
          const err12 = { instancePath: instancePath + "/edges", schemaPath: "#/properties/edges/maxItems", keyword: "maxItems", params: { limit: 200 }, message: "must NOT have more than 200 items" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        const len1 = data3.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (!validate25(data3[i1], { instancePath: instancePath + "/edges/" + i1, parentData: data3, parentDataProperty: i1, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err13 = { instancePath: instancePath + "/edges", schemaPath: "#/properties/edges/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.metadata !== void 0) {
      let data5 = data.metadata;
      if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
        if (data5.title === void 0) {
          const err14 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data5.challengeId === void 0) {
          const err15 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "challengeId" }, message: "must have required property 'challengeId'" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data5.challengeVersion === void 0) {
          const err16 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "challengeVersion" }, message: "must have required property 'challengeVersion'" };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data5.createdAt === void 0) {
          const err17 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "createdAt" }, message: "must have required property 'createdAt'" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data5.locale === void 0) {
          const err18 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "locale" }, message: "must have required property 'locale'" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data5.decisions === void 0) {
          const err19 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "decisions" }, message: "must have required property 'decisions'" };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
        if (data5.requirementEvidence === void 0) {
          const err20 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/required", keyword: "required", params: { missingProperty: "requirementEvidence" }, message: "must have required property 'requirementEvidence'" };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        for (const key1 in data5) {
          if (!(key1 === "title" || key1 === "challengeId" || key1 === "challengeVersion" || key1 === "createdAt" || key1 === "locale" || key1 === "decisions" || key1 === "requirementEvidence")) {
            const err21 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data5.title !== void 0) {
          let data6 = data5.title;
          if (typeof data6 === "string") {
            if (func1(data6) > 120) {
              const err22 = { instancePath: instancePath + "/metadata/title", schemaPath: "#/properties/metadata/properties/title/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err23 = { instancePath: instancePath + "/metadata/title", schemaPath: "#/properties/metadata/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
          } else {
            const err24 = { instancePath: instancePath + "/metadata/title", schemaPath: "#/properties/metadata/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
        if (data5.challengeId !== void 0) {
          let data7 = data5.challengeId;
          if (typeof data7 === "string") {
            if (!pattern4.test(data7)) {
              const err25 = { instancePath: instancePath + "/metadata/challengeId", schemaPath: "#/properties/metadata/properties/challengeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
          } else {
            const err26 = { instancePath: instancePath + "/metadata/challengeId", schemaPath: "#/properties/metadata/properties/challengeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
        if (data5.challengeVersion !== void 0) {
          let data8 = data5.challengeVersion;
          if (typeof data8 === "string") {
            if (func1(data8) > 120) {
              const err27 = { instancePath: instancePath + "/metadata/challengeVersion", schemaPath: "#/properties/metadata/properties/challengeVersion/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err27];
              } else {
                vErrors.push(err27);
              }
              errors++;
            }
            if (func1(data8) < 1) {
              const err28 = { instancePath: instancePath + "/metadata/challengeVersion", schemaPath: "#/properties/metadata/properties/challengeVersion/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = { instancePath: instancePath + "/metadata/challengeVersion", schemaPath: "#/properties/metadata/properties/challengeVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
        if (data5.createdAt !== void 0) {
          if (!(typeof data5.createdAt === "string")) {
            const err30 = { instancePath: instancePath + "/metadata/createdAt", schemaPath: "#/properties/metadata/properties/createdAt/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        if (data5.locale !== void 0) {
          let data10 = data5.locale;
          if (typeof data10 !== "string") {
            const err31 = { instancePath: instancePath + "/metadata/locale", schemaPath: "#/properties/metadata/properties/locale/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
          if (!(data10 === "pt-BR" || data10 === "en")) {
            const err32 = { instancePath: instancePath + "/metadata/locale", schemaPath: "#/properties/metadata/properties/locale/enum", keyword: "enum", params: { allowedValues: schema31.properties.metadata.properties.locale.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
        if (data5.decisions !== void 0) {
          let data11 = data5.decisions;
          if (Array.isArray(data11)) {
            if (data11.length > 100) {
              const err33 = { instancePath: instancePath + "/metadata/decisions", schemaPath: "#/properties/metadata/properties/decisions/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
              if (vErrors === null) {
                vErrors = [err33];
              } else {
                vErrors.push(err33);
              }
              errors++;
            }
            const len2 = data11.length;
            for (let i2 = 0; i2 < len2; i2++) {
              let data12 = data11[i2];
              if (data12 && typeof data12 == "object" && !Array.isArray(data12)) {
                if (data12.id === void 0) {
                  const err34 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
                if (data12.title === void 0) {
                  const err35 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
                  if (vErrors === null) {
                    vErrors = [err35];
                  } else {
                    vErrors.push(err35);
                  }
                  errors++;
                }
                if (data12.rationale === void 0) {
                  const err36 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/required", keyword: "required", params: { missingProperty: "rationale" }, message: "must have required property 'rationale'" };
                  if (vErrors === null) {
                    vErrors = [err36];
                  } else {
                    vErrors.push(err36);
                  }
                  errors++;
                }
                if (data12.nodeIds === void 0) {
                  const err37 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/required", keyword: "required", params: { missingProperty: "nodeIds" }, message: "must have required property 'nodeIds'" };
                  if (vErrors === null) {
                    vErrors = [err37];
                  } else {
                    vErrors.push(err37);
                  }
                  errors++;
                }
                if (data12.requirementIds === void 0) {
                  const err38 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/required", keyword: "required", params: { missingProperty: "requirementIds" }, message: "must have required property 'requirementIds'" };
                  if (vErrors === null) {
                    vErrors = [err38];
                  } else {
                    vErrors.push(err38);
                  }
                  errors++;
                }
                for (const key2 in data12) {
                  if (!(key2 === "id" || key2 === "title" || key2 === "rationale" || key2 === "nodeIds" || key2 === "requirementIds")) {
                    const err39 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err39];
                    } else {
                      vErrors.push(err39);
                    }
                    errors++;
                  }
                }
                if (data12.id !== void 0) {
                  let data13 = data12.id;
                  if (typeof data13 === "string") {
                    if (!pattern4.test(data13)) {
                      const err40 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/id", schemaPath: "#/$defs/decision/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err40];
                      } else {
                        vErrors.push(err40);
                      }
                      errors++;
                    }
                  } else {
                    const err41 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/id", schemaPath: "#/$defs/decision/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err41];
                    } else {
                      vErrors.push(err41);
                    }
                    errors++;
                  }
                }
                if (data12.title !== void 0) {
                  let data14 = data12.title;
                  if (typeof data14 === "string") {
                    if (func1(data14) > 120) {
                      const err42 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/title", schemaPath: "#/$defs/decision/properties/title/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
                      if (vErrors === null) {
                        vErrors = [err42];
                      } else {
                        vErrors.push(err42);
                      }
                      errors++;
                    }
                    if (func1(data14) < 1) {
                      const err43 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/title", schemaPath: "#/$defs/decision/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                      if (vErrors === null) {
                        vErrors = [err43];
                      } else {
                        vErrors.push(err43);
                      }
                      errors++;
                    }
                  } else {
                    const err44 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/title", schemaPath: "#/$defs/decision/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err44];
                    } else {
                      vErrors.push(err44);
                    }
                    errors++;
                  }
                }
                if (data12.rationale !== void 0) {
                  let data15 = data12.rationale;
                  if (typeof data15 === "string") {
                    if (func1(data15) > 1e4) {
                      const err45 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/rationale", schemaPath: "#/$defs/decision/properties/rationale/maxLength", keyword: "maxLength", params: { limit: 1e4 }, message: "must NOT have more than 10000 characters" };
                      if (vErrors === null) {
                        vErrors = [err45];
                      } else {
                        vErrors.push(err45);
                      }
                      errors++;
                    }
                  } else {
                    const err46 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/rationale", schemaPath: "#/$defs/decision/properties/rationale/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err46];
                    } else {
                      vErrors.push(err46);
                    }
                    errors++;
                  }
                }
                if (data12.nodeIds !== void 0) {
                  let data16 = data12.nodeIds;
                  if (Array.isArray(data16)) {
                    if (data16.length > 100) {
                      const err47 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/nodeIds", schemaPath: "#/$defs/decision/properties/nodeIds/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
                      if (vErrors === null) {
                        vErrors = [err47];
                      } else {
                        vErrors.push(err47);
                      }
                      errors++;
                    }
                    const len3 = data16.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                      let data17 = data16[i3];
                      if (typeof data17 === "string") {
                        if (!pattern4.test(data17)) {
                          const err48 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/nodeIds/" + i3, schemaPath: "#/$defs/decision/properties/nodeIds/items/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                          if (vErrors === null) {
                            vErrors = [err48];
                          } else {
                            vErrors.push(err48);
                          }
                          errors++;
                        }
                      } else {
                        const err49 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/nodeIds/" + i3, schemaPath: "#/$defs/decision/properties/nodeIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err49];
                        } else {
                          vErrors.push(err49);
                        }
                        errors++;
                      }
                    }
                  } else {
                    const err50 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/nodeIds", schemaPath: "#/$defs/decision/properties/nodeIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                      vErrors = [err50];
                    } else {
                      vErrors.push(err50);
                    }
                    errors++;
                  }
                }
                if (data12.requirementIds !== void 0) {
                  let data18 = data12.requirementIds;
                  if (Array.isArray(data18)) {
                    if (data18.length > 100) {
                      const err51 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/requirementIds", schemaPath: "#/$defs/decision/properties/requirementIds/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
                      if (vErrors === null) {
                        vErrors = [err51];
                      } else {
                        vErrors.push(err51);
                      }
                      errors++;
                    }
                    const len4 = data18.length;
                    for (let i4 = 0; i4 < len4; i4++) {
                      let data19 = data18[i4];
                      if (typeof data19 === "string") {
                        if (!pattern4.test(data19)) {
                          const err52 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/requirementIds/" + i4, schemaPath: "#/$defs/decision/properties/requirementIds/items/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                          if (vErrors === null) {
                            vErrors = [err52];
                          } else {
                            vErrors.push(err52);
                          }
                          errors++;
                        }
                      } else {
                        const err53 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/requirementIds/" + i4, schemaPath: "#/$defs/decision/properties/requirementIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err53];
                        } else {
                          vErrors.push(err53);
                        }
                        errors++;
                      }
                    }
                  } else {
                    const err54 = { instancePath: instancePath + "/metadata/decisions/" + i2 + "/requirementIds", schemaPath: "#/$defs/decision/properties/requirementIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                      vErrors = [err54];
                    } else {
                      vErrors.push(err54);
                    }
                    errors++;
                  }
                }
              } else {
                const err55 = { instancePath: instancePath + "/metadata/decisions/" + i2, schemaPath: "#/$defs/decision/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err55];
                } else {
                  vErrors.push(err55);
                }
                errors++;
              }
            }
          } else {
            const err56 = { instancePath: instancePath + "/metadata/decisions", schemaPath: "#/properties/metadata/properties/decisions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err56];
            } else {
              vErrors.push(err56);
            }
            errors++;
          }
        }
        if (data5.requirementEvidence !== void 0) {
          let data20 = data5.requirementEvidence;
          if (Array.isArray(data20)) {
            if (data20.length > 200) {
              const err57 = { instancePath: instancePath + "/metadata/requirementEvidence", schemaPath: "#/properties/metadata/properties/requirementEvidence/maxItems", keyword: "maxItems", params: { limit: 200 }, message: "must NOT have more than 200 items" };
              if (vErrors === null) {
                vErrors = [err57];
              } else {
                vErrors.push(err57);
              }
              errors++;
            }
            const len5 = data20.length;
            for (let i5 = 0; i5 < len5; i5++) {
              let data21 = data20[i5];
              if (data21 && typeof data21 == "object" && !Array.isArray(data21)) {
                if (data21.requirementId === void 0) {
                  const err58 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/required", keyword: "required", params: { missingProperty: "requirementId" }, message: "must have required property 'requirementId'" };
                  if (vErrors === null) {
                    vErrors = [err58];
                  } else {
                    vErrors.push(err58);
                  }
                  errors++;
                }
                if (data21.kind === void 0) {
                  const err59 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/required", keyword: "required", params: { missingProperty: "kind" }, message: "must have required property 'kind'" };
                  if (vErrors === null) {
                    vErrors = [err59];
                  } else {
                    vErrors.push(err59);
                  }
                  errors++;
                }
                if (data21.refId === void 0) {
                  const err60 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/required", keyword: "required", params: { missingProperty: "refId" }, message: "must have required property 'refId'" };
                  if (vErrors === null) {
                    vErrors = [err60];
                  } else {
                    vErrors.push(err60);
                  }
                  errors++;
                }
                if (data21.explanation === void 0) {
                  const err61 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/required", keyword: "required", params: { missingProperty: "explanation" }, message: "must have required property 'explanation'" };
                  if (vErrors === null) {
                    vErrors = [err61];
                  } else {
                    vErrors.push(err61);
                  }
                  errors++;
                }
                if (data21.selfDeclared === void 0) {
                  const err62 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/required", keyword: "required", params: { missingProperty: "selfDeclared" }, message: "must have required property 'selfDeclared'" };
                  if (vErrors === null) {
                    vErrors = [err62];
                  } else {
                    vErrors.push(err62);
                  }
                  errors++;
                }
                for (const key3 in data21) {
                  if (!(key3 === "requirementId" || key3 === "kind" || key3 === "refId" || key3 === "explanation" || key3 === "selfDeclared")) {
                    const err63 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err63];
                    } else {
                      vErrors.push(err63);
                    }
                    errors++;
                  }
                }
                if (data21.requirementId !== void 0) {
                  let data22 = data21.requirementId;
                  if (typeof data22 === "string") {
                    if (!pattern4.test(data22)) {
                      const err64 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/requirementId", schemaPath: "#/$defs/evidence/properties/requirementId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err64];
                      } else {
                        vErrors.push(err64);
                      }
                      errors++;
                    }
                  } else {
                    const err65 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/requirementId", schemaPath: "#/$defs/evidence/properties/requirementId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err65];
                    } else {
                      vErrors.push(err65);
                    }
                    errors++;
                  }
                }
                if (data21.kind !== void 0) {
                  let data23 = data21.kind;
                  if (typeof data23 !== "string") {
                    const err66 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/kind", schemaPath: "#/$defs/evidence/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err66];
                    } else {
                      vErrors.push(err66);
                    }
                    errors++;
                  }
                  if (!(data23 === "flow" || data23 === "policy" || data23 === "manual")) {
                    const err67 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/kind", schemaPath: "#/$defs/evidence/properties/kind/enum", keyword: "enum", params: { allowedValues: schema44.properties.kind.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                      vErrors = [err67];
                    } else {
                      vErrors.push(err67);
                    }
                    errors++;
                  }
                }
                if (data21.refId !== void 0) {
                  let data24 = data21.refId;
                  if (typeof data24 === "string") {
                    if (!pattern4.test(data24)) {
                      const err68 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/refId", schemaPath: "#/$defs/evidence/properties/refId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err68];
                      } else {
                        vErrors.push(err68);
                      }
                      errors++;
                    }
                  } else {
                    const err69 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/refId", schemaPath: "#/$defs/evidence/properties/refId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err69];
                    } else {
                      vErrors.push(err69);
                    }
                    errors++;
                  }
                }
                if (data21.explanation !== void 0) {
                  let data25 = data21.explanation;
                  if (typeof data25 === "string") {
                    if (func1(data25) > 1e4) {
                      const err70 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/explanation", schemaPath: "#/$defs/evidence/properties/explanation/maxLength", keyword: "maxLength", params: { limit: 1e4 }, message: "must NOT have more than 10000 characters" };
                      if (vErrors === null) {
                        vErrors = [err70];
                      } else {
                        vErrors.push(err70);
                      }
                      errors++;
                    }
                  } else {
                    const err71 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/explanation", schemaPath: "#/$defs/evidence/properties/explanation/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err71];
                    } else {
                      vErrors.push(err71);
                    }
                    errors++;
                  }
                }
                if (data21.selfDeclared !== void 0) {
                  if (typeof data21.selfDeclared !== "boolean") {
                    const err72 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5 + "/selfDeclared", schemaPath: "#/$defs/evidence/properties/selfDeclared/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                      vErrors = [err72];
                    } else {
                      vErrors.push(err72);
                    }
                    errors++;
                  }
                }
              } else {
                const err73 = { instancePath: instancePath + "/metadata/requirementEvidence/" + i5, schemaPath: "#/$defs/evidence/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err73];
                } else {
                  vErrors.push(err73);
                }
                errors++;
              }
            }
          } else {
            const err74 = { instancePath: instancePath + "/metadata/requirementEvidence", schemaPath: "#/properties/metadata/properties/requirementEvidence/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err74];
            } else {
              vErrors.push(err74);
            }
            errors++;
          }
        }
      } else {
        const err75 = { instancePath: instancePath + "/metadata", schemaPath: "#/properties/metadata/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err75];
        } else {
          vErrors.push(err75);
        }
        errors++;
      }
    }
    if (data.traffic !== void 0) {
      let data27 = data.traffic;
      if (data27 && typeof data27 == "object" && !Array.isArray(data27)) {
        if (data27.workloads === void 0) {
          const err76 = { instancePath: instancePath + "/traffic", schemaPath: "#/properties/traffic/required", keyword: "required", params: { missingProperty: "workloads" }, message: "must have required property 'workloads'" };
          if (vErrors === null) {
            vErrors = [err76];
          } else {
            vErrors.push(err76);
          }
          errors++;
        }
        if (data27.flows === void 0) {
          const err77 = { instancePath: instancePath + "/traffic", schemaPath: "#/properties/traffic/required", keyword: "required", params: { missingProperty: "flows" }, message: "must have required property 'flows'" };
          if (vErrors === null) {
            vErrors = [err77];
          } else {
            vErrors.push(err77);
          }
          errors++;
        }
        for (const key4 in data27) {
          if (!(key4 === "workloads" || key4 === "flows")) {
            const err78 = { instancePath: instancePath + "/traffic", schemaPath: "#/properties/traffic/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err78];
            } else {
              vErrors.push(err78);
            }
            errors++;
          }
        }
        if (data27.workloads !== void 0) {
          let data28 = data27.workloads;
          if (Array.isArray(data28)) {
            if (data28.length > 20) {
              const err79 = { instancePath: instancePath + "/traffic/workloads", schemaPath: "#/properties/traffic/properties/workloads/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" };
              if (vErrors === null) {
                vErrors = [err79];
              } else {
                vErrors.push(err79);
              }
              errors++;
            }
            const len6 = data28.length;
            for (let i6 = 0; i6 < len6; i6++) {
              let data29 = data28[i6];
              if (data29 && typeof data29 == "object" && !Array.isArray(data29)) {
                if (data29.id === void 0) {
                  const err80 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
                  if (vErrors === null) {
                    vErrors = [err80];
                  } else {
                    vErrors.push(err80);
                  }
                  errors++;
                }
                if (data29.operationId === void 0) {
                  const err81 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "operationId" }, message: "must have required property 'operationId'" };
                  if (vErrors === null) {
                    vErrors = [err81];
                  } else {
                    vErrors.push(err81);
                  }
                  errors++;
                }
                if (data29.source === void 0) {
                  const err82 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property 'source'" };
                  if (vErrors === null) {
                    vErrors = [err82];
                  } else {
                    vErrors.push(err82);
                  }
                  errors++;
                }
                if (data29.averageRps === void 0) {
                  const err83 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "averageRps" }, message: "must have required property 'averageRps'" };
                  if (vErrors === null) {
                    vErrors = [err83];
                  } else {
                    vErrors.push(err83);
                  }
                  errors++;
                }
                if (data29.peakRps === void 0) {
                  const err84 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "peakRps" }, message: "must have required property 'peakRps'" };
                  if (vErrors === null) {
                    vErrors = [err84];
                  } else {
                    vErrors.push(err84);
                  }
                  errors++;
                }
                if (data29.payloadBytes === void 0) {
                  const err85 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "payloadBytes" }, message: "must have required property 'payloadBytes'" };
                  if (vErrors === null) {
                    vErrors = [err85];
                  } else {
                    vErrors.push(err85);
                  }
                  errors++;
                }
                if (data29.deadlineMs === void 0) {
                  const err86 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "deadlineMs" }, message: "must have required property 'deadlineMs'" };
                  if (vErrors === null) {
                    vErrors = [err86];
                  } else {
                    vErrors.push(err86);
                  }
                  errors++;
                }
                if (data29.mutable === void 0) {
                  const err87 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "mutable" }, message: "must have required property 'mutable'" };
                  if (vErrors === null) {
                    vErrors = [err87];
                  } else {
                    vErrors.push(err87);
                  }
                  errors++;
                }
                if (data29.manual === void 0) {
                  const err88 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/required", keyword: "required", params: { missingProperty: "manual" }, message: "must have required property 'manual'" };
                  if (vErrors === null) {
                    vErrors = [err88];
                  } else {
                    vErrors.push(err88);
                  }
                  errors++;
                }
                for (const key5 in data29) {
                  if (!func5.call(schema45.properties, key5)) {
                    const err89 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err89];
                    } else {
                      vErrors.push(err89);
                    }
                    errors++;
                  }
                }
                if (data29.id !== void 0) {
                  let data30 = data29.id;
                  if (typeof data30 === "string") {
                    if (!pattern4.test(data30)) {
                      const err90 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/id", schemaPath: "#/$defs/workload/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err90];
                      } else {
                        vErrors.push(err90);
                      }
                      errors++;
                    }
                  } else {
                    const err91 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/id", schemaPath: "#/$defs/workload/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err91];
                    } else {
                      vErrors.push(err91);
                    }
                    errors++;
                  }
                }
                if (data29.operationId !== void 0) {
                  let data31 = data29.operationId;
                  if (typeof data31 === "string") {
                    if (!pattern4.test(data31)) {
                      const err92 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/operationId", schemaPath: "#/$defs/workload/properties/operationId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err92];
                      } else {
                        vErrors.push(err92);
                      }
                      errors++;
                    }
                  } else {
                    const err93 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/operationId", schemaPath: "#/$defs/workload/properties/operationId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err93];
                    } else {
                      vErrors.push(err93);
                    }
                    errors++;
                  }
                }
                if (data29.source !== void 0) {
                  let data32 = data29.source;
                  if (typeof data32 !== "string") {
                    const err94 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/source", schemaPath: "#/$defs/workload/properties/source/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err94];
                    } else {
                      vErrors.push(err94);
                    }
                    errors++;
                  }
                  if (!(data32 === "external" || data32 === "queue")) {
                    const err95 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/source", schemaPath: "#/$defs/workload/properties/source/enum", keyword: "enum", params: { allowedValues: schema45.properties.source.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                      vErrors = [err95];
                    } else {
                      vErrors.push(err95);
                    }
                    errors++;
                  }
                }
                if (data29.queueSourceNodeId !== void 0) {
                  let data33 = data29.queueSourceNodeId;
                  if (typeof data33 === "string") {
                    if (!pattern4.test(data33)) {
                      const err96 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/queueSourceNodeId", schemaPath: "#/$defs/workload/properties/queueSourceNodeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err96];
                      } else {
                        vErrors.push(err96);
                      }
                      errors++;
                    }
                  } else {
                    const err97 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/queueSourceNodeId", schemaPath: "#/$defs/workload/properties/queueSourceNodeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err97];
                    } else {
                      vErrors.push(err97);
                    }
                    errors++;
                  }
                }
                if (data29.averageRps !== void 0) {
                  let data34 = data29.averageRps;
                  if (typeof data34 == "number") {
                    if (data34 < 0 || isNaN(data34)) {
                      const err98 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/averageRps", schemaPath: "#/$defs/workload/properties/averageRps/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err98];
                      } else {
                        vErrors.push(err98);
                      }
                      errors++;
                    }
                  } else {
                    const err99 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/averageRps", schemaPath: "#/$defs/workload/properties/averageRps/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err99];
                    } else {
                      vErrors.push(err99);
                    }
                    errors++;
                  }
                }
                if (data29.peakRps !== void 0) {
                  let data35 = data29.peakRps;
                  if (typeof data35 == "number") {
                    if (data35 < 0 || isNaN(data35)) {
                      const err100 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/peakRps", schemaPath: "#/$defs/workload/properties/peakRps/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err100];
                      } else {
                        vErrors.push(err100);
                      }
                      errors++;
                    }
                  } else {
                    const err101 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/peakRps", schemaPath: "#/$defs/workload/properties/peakRps/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err101];
                    } else {
                      vErrors.push(err101);
                    }
                    errors++;
                  }
                }
                if (data29.payloadBytes !== void 0) {
                  let data36 = data29.payloadBytes;
                  if (typeof data36 == "number") {
                    if (data36 < 0 || isNaN(data36)) {
                      const err102 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/payloadBytes", schemaPath: "#/$defs/workload/properties/payloadBytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err102];
                      } else {
                        vErrors.push(err102);
                      }
                      errors++;
                    }
                  } else {
                    const err103 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/payloadBytes", schemaPath: "#/$defs/workload/properties/payloadBytes/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err103];
                    } else {
                      vErrors.push(err103);
                    }
                    errors++;
                  }
                }
                if (data29.concurrentConnections !== void 0) {
                  let data37 = data29.concurrentConnections;
                  if (typeof data37 == "number") {
                    if (data37 < 0 || isNaN(data37)) {
                      const err104 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/concurrentConnections", schemaPath: "#/$defs/workload/properties/concurrentConnections/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err104];
                      } else {
                        vErrors.push(err104);
                      }
                      errors++;
                    }
                  } else {
                    const err105 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/concurrentConnections", schemaPath: "#/$defs/workload/properties/concurrentConnections/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err105];
                    } else {
                      vErrors.push(err105);
                    }
                    errors++;
                  }
                }
                if (data29.deadlineMs !== void 0) {
                  let data38 = data29.deadlineMs;
                  if (typeof data38 == "number") {
                    if (data38 <= 0 || isNaN(data38)) {
                      const err106 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/deadlineMs", schemaPath: "#/$defs/workload/properties/deadlineMs/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
                      if (vErrors === null) {
                        vErrors = [err106];
                      } else {
                        vErrors.push(err106);
                      }
                      errors++;
                    }
                  } else {
                    const err107 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/deadlineMs", schemaPath: "#/$defs/workload/properties/deadlineMs/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err107];
                    } else {
                      vErrors.push(err107);
                    }
                    errors++;
                  }
                }
                if (data29.mutable !== void 0) {
                  if (typeof data29.mutable !== "boolean") {
                    const err108 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/mutable", schemaPath: "#/$defs/workload/properties/mutable/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                      vErrors = [err108];
                    } else {
                      vErrors.push(err108);
                    }
                    errors++;
                  }
                }
                if (data29.manual !== void 0) {
                  if (typeof data29.manual !== "boolean") {
                    const err109 = { instancePath: instancePath + "/traffic/workloads/" + i6 + "/manual", schemaPath: "#/$defs/workload/properties/manual/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                      vErrors = [err109];
                    } else {
                      vErrors.push(err109);
                    }
                    errors++;
                  }
                }
              } else {
                const err110 = { instancePath: instancePath + "/traffic/workloads/" + i6, schemaPath: "#/$defs/workload/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err110];
                } else {
                  vErrors.push(err110);
                }
                errors++;
              }
            }
          } else {
            const err111 = { instancePath: instancePath + "/traffic/workloads", schemaPath: "#/properties/traffic/properties/workloads/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err111];
            } else {
              vErrors.push(err111);
            }
            errors++;
          }
        }
        if (data27.flows !== void 0) {
          let data41 = data27.flows;
          if (Array.isArray(data41)) {
            if (data41.length > 20) {
              const err112 = { instancePath: instancePath + "/traffic/flows", schemaPath: "#/properties/traffic/properties/flows/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" };
              if (vErrors === null) {
                vErrors = [err112];
              } else {
                vErrors.push(err112);
              }
              errors++;
            }
            const len7 = data41.length;
            for (let i7 = 0; i7 < len7; i7++) {
              if (!validate27(data41[i7], { instancePath: instancePath + "/traffic/flows/" + i7, parentData: data41, parentDataProperty: i7, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
                errors = vErrors.length;
              }
            }
          } else {
            const err113 = { instancePath: instancePath + "/traffic/flows", schemaPath: "#/properties/traffic/properties/flows/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err113];
            } else {
              vErrors.push(err113);
            }
            errors++;
          }
        }
      } else {
        const err114 = { instancePath: instancePath + "/traffic", schemaPath: "#/properties/traffic/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err114];
        } else {
          vErrors.push(err114);
        }
        errors++;
      }
    }
    if (data.dependencies !== void 0) {
      let data43 = data.dependencies;
      if (Array.isArray(data43)) {
        if (data43.length > 200) {
          const err115 = { instancePath: instancePath + "/dependencies", schemaPath: "#/properties/dependencies/maxItems", keyword: "maxItems", params: { limit: 200 }, message: "must NOT have more than 200 items" };
          if (vErrors === null) {
            vErrors = [err115];
          } else {
            vErrors.push(err115);
          }
          errors++;
        }
        const len8 = data43.length;
        for (let i8 = 0; i8 < len8; i8++) {
          let data44 = data43[i8];
          if (data44 && typeof data44 == "object" && !Array.isArray(data44)) {
            if (data44.id === void 0) {
              const err116 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
              if (vErrors === null) {
                vErrors = [err116];
              } else {
                vErrors.push(err116);
              }
              errors++;
            }
            if (data44.edgeId === void 0) {
              const err117 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/required", keyword: "required", params: { missingProperty: "edgeId" }, message: "must have required property 'edgeId'" };
              if (vErrors === null) {
                vErrors = [err117];
              } else {
                vErrors.push(err117);
              }
              errors++;
            }
            if (data44.operationId === void 0) {
              const err118 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/required", keyword: "required", params: { missingProperty: "operationId" }, message: "must have required property 'operationId'" };
              if (vErrors === null) {
                vErrors = [err118];
              } else {
                vErrors.push(err118);
              }
              errors++;
            }
            if (data44.semantics === void 0) {
              const err119 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/required", keyword: "required", params: { missingProperty: "semantics" }, message: "must have required property 'semantics'" };
              if (vErrors === null) {
                vErrors = [err119];
              } else {
                vErrors.push(err119);
              }
              errors++;
            }
            for (const key6 in data44) {
              if (!(key6 === "id" || key6 === "edgeId" || key6 === "operationId" || key6 === "semantics" || key6 === "fallbackFlowId")) {
                const err120 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err120];
                } else {
                  vErrors.push(err120);
                }
                errors++;
              }
            }
            if (data44.id !== void 0) {
              let data45 = data44.id;
              if (typeof data45 === "string") {
                if (!pattern4.test(data45)) {
                  const err121 = { instancePath: instancePath + "/dependencies/" + i8 + "/id", schemaPath: "#/$defs/dependency/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err121];
                  } else {
                    vErrors.push(err121);
                  }
                  errors++;
                }
              } else {
                const err122 = { instancePath: instancePath + "/dependencies/" + i8 + "/id", schemaPath: "#/$defs/dependency/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err122];
                } else {
                  vErrors.push(err122);
                }
                errors++;
              }
            }
            if (data44.edgeId !== void 0) {
              let data46 = data44.edgeId;
              if (typeof data46 === "string") {
                if (!pattern4.test(data46)) {
                  const err123 = { instancePath: instancePath + "/dependencies/" + i8 + "/edgeId", schemaPath: "#/$defs/dependency/properties/edgeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err123];
                  } else {
                    vErrors.push(err123);
                  }
                  errors++;
                }
              } else {
                const err124 = { instancePath: instancePath + "/dependencies/" + i8 + "/edgeId", schemaPath: "#/$defs/dependency/properties/edgeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err124];
                } else {
                  vErrors.push(err124);
                }
                errors++;
              }
            }
            if (data44.operationId !== void 0) {
              let data47 = data44.operationId;
              if (typeof data47 === "string") {
                if (!pattern4.test(data47)) {
                  const err125 = { instancePath: instancePath + "/dependencies/" + i8 + "/operationId", schemaPath: "#/$defs/dependency/properties/operationId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err125];
                  } else {
                    vErrors.push(err125);
                  }
                  errors++;
                }
              } else {
                const err126 = { instancePath: instancePath + "/dependencies/" + i8 + "/operationId", schemaPath: "#/$defs/dependency/properties/operationId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err126];
                } else {
                  vErrors.push(err126);
                }
                errors++;
              }
            }
            if (data44.semantics !== void 0) {
              let data48 = data44.semantics;
              if (typeof data48 !== "string") {
                const err127 = { instancePath: instancePath + "/dependencies/" + i8 + "/semantics", schemaPath: "#/$defs/dependency/properties/semantics/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err127];
                } else {
                  vErrors.push(err127);
                }
                errors++;
              }
              if (!(data48 === "required" || data48 === "optional" || data48 === "degradable")) {
                const err128 = { instancePath: instancePath + "/dependencies/" + i8 + "/semantics", schemaPath: "#/$defs/dependency/properties/semantics/enum", keyword: "enum", params: { allowedValues: schema48.properties.semantics.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err128];
                } else {
                  vErrors.push(err128);
                }
                errors++;
              }
            }
            if (data44.fallbackFlowId !== void 0) {
              let data49 = data44.fallbackFlowId;
              if (typeof data49 === "string") {
                if (!pattern4.test(data49)) {
                  const err129 = { instancePath: instancePath + "/dependencies/" + i8 + "/fallbackFlowId", schemaPath: "#/$defs/dependency/properties/fallbackFlowId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                  if (vErrors === null) {
                    vErrors = [err129];
                  } else {
                    vErrors.push(err129);
                  }
                  errors++;
                }
              } else {
                const err130 = { instancePath: instancePath + "/dependencies/" + i8 + "/fallbackFlowId", schemaPath: "#/$defs/dependency/properties/fallbackFlowId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err130];
                } else {
                  vErrors.push(err130);
                }
                errors++;
              }
            }
          } else {
            const err131 = { instancePath: instancePath + "/dependencies/" + i8, schemaPath: "#/$defs/dependency/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err131];
            } else {
              vErrors.push(err131);
            }
            errors++;
          }
        }
      } else {
        const err132 = { instancePath: instancePath + "/dependencies", schemaPath: "#/properties/dependencies/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err132];
        } else {
          vErrors.push(err132);
        }
        errors++;
      }
    }
    if (data.configuration !== void 0) {
      let data50 = data.configuration;
      if (data50 && typeof data50 == "object" && !Array.isArray(data50)) {
        if (data50.catalogVersion === void 0) {
          const err133 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "catalogVersion" }, message: "must have required property 'catalogVersion'" };
          if (vErrors === null) {
            vErrors = [err133];
          } else {
            vErrors.push(err133);
          }
          errors++;
        }
        if (data50.rulesetVersion === void 0) {
          const err134 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "rulesetVersion" }, message: "must have required property 'rulesetVersion'" };
          if (vErrors === null) {
            vErrors = [err134];
          } else {
            vErrors.push(err134);
          }
          errors++;
        }
        if (data50.engineVersion === void 0) {
          const err135 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "engineVersion" }, message: "must have required property 'engineVersion'" };
          if (vErrors === null) {
            vErrors = [err135];
          } else {
            vErrors.push(err135);
          }
          errors++;
        }
        if (data50.seed === void 0) {
          const err136 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "seed" }, message: "must have required property 'seed'" };
          if (vErrors === null) {
            vErrors = [err136];
          } else {
            vErrors.push(err136);
          }
          errors++;
        }
        if (data50.durationSec === void 0) {
          const err137 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "durationSec" }, message: "must have required property 'durationSec'" };
          if (vErrors === null) {
            vErrors = [err137];
          } else {
            vErrors.push(err137);
          }
          errors++;
        }
        if (data50.tickSec === void 0) {
          const err138 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "tickSec" }, message: "must have required property 'tickSec'" };
          if (vErrors === null) {
            vErrors = [err138];
          } else {
            vErrors.push(err138);
          }
          errors++;
        }
        if (data50.loadMode === void 0) {
          const err139 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "loadMode" }, message: "must have required property 'loadMode'" };
          if (vErrors === null) {
            vErrors = [err139];
          } else {
            vErrors.push(err139);
          }
          errors++;
        }
        if (data50.events === void 0) {
          const err140 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/required", keyword: "required", params: { missingProperty: "events" }, message: "must have required property 'events'" };
          if (vErrors === null) {
            vErrors = [err140];
          } else {
            vErrors.push(err140);
          }
          errors++;
        }
        for (const key7 in data50) {
          if (!(key7 === "catalogVersion" || key7 === "rulesetVersion" || key7 === "engineVersion" || key7 === "seed" || key7 === "durationSec" || key7 === "tickSec" || key7 === "loadMode" || key7 === "events")) {
            const err141 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key7 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err141];
            } else {
              vErrors.push(err141);
            }
            errors++;
          }
        }
        if (data50.catalogVersion !== void 0) {
          let data51 = data50.catalogVersion;
          if (typeof data51 === "string") {
            if (func1(data51) > 120) {
              const err142 = { instancePath: instancePath + "/configuration/catalogVersion", schemaPath: "#/properties/configuration/properties/catalogVersion/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err142];
              } else {
                vErrors.push(err142);
              }
              errors++;
            }
            if (func1(data51) < 1) {
              const err143 = { instancePath: instancePath + "/configuration/catalogVersion", schemaPath: "#/properties/configuration/properties/catalogVersion/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err143];
              } else {
                vErrors.push(err143);
              }
              errors++;
            }
          } else {
            const err144 = { instancePath: instancePath + "/configuration/catalogVersion", schemaPath: "#/properties/configuration/properties/catalogVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err144];
            } else {
              vErrors.push(err144);
            }
            errors++;
          }
        }
        if (data50.rulesetVersion !== void 0) {
          let data52 = data50.rulesetVersion;
          if (typeof data52 === "string") {
            if (func1(data52) > 120) {
              const err145 = { instancePath: instancePath + "/configuration/rulesetVersion", schemaPath: "#/properties/configuration/properties/rulesetVersion/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err145];
              } else {
                vErrors.push(err145);
              }
              errors++;
            }
            if (func1(data52) < 1) {
              const err146 = { instancePath: instancePath + "/configuration/rulesetVersion", schemaPath: "#/properties/configuration/properties/rulesetVersion/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err146];
              } else {
                vErrors.push(err146);
              }
              errors++;
            }
          } else {
            const err147 = { instancePath: instancePath + "/configuration/rulesetVersion", schemaPath: "#/properties/configuration/properties/rulesetVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err147];
            } else {
              vErrors.push(err147);
            }
            errors++;
          }
        }
        if (data50.engineVersion !== void 0) {
          let data53 = data50.engineVersion;
          if (typeof data53 === "string") {
            if (func1(data53) > 120) {
              const err148 = { instancePath: instancePath + "/configuration/engineVersion", schemaPath: "#/properties/configuration/properties/engineVersion/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err148];
              } else {
                vErrors.push(err148);
              }
              errors++;
            }
            if (func1(data53) < 1) {
              const err149 = { instancePath: instancePath + "/configuration/engineVersion", schemaPath: "#/properties/configuration/properties/engineVersion/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err149];
              } else {
                vErrors.push(err149);
              }
              errors++;
            }
          } else {
            const err150 = { instancePath: instancePath + "/configuration/engineVersion", schemaPath: "#/properties/configuration/properties/engineVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err150];
            } else {
              vErrors.push(err150);
            }
            errors++;
          }
        }
        if (data50.seed !== void 0) {
          let data54 = data50.seed;
          if (!(typeof data54 == "number" && (!(data54 % 1) && !isNaN(data54)))) {
            const err151 = { instancePath: instancePath + "/configuration/seed", schemaPath: "#/properties/configuration/properties/seed/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
              vErrors = [err151];
            } else {
              vErrors.push(err151);
            }
            errors++;
          }
          if (typeof data54 == "number") {
            if (data54 > 4294967295 || isNaN(data54)) {
              const err152 = { instancePath: instancePath + "/configuration/seed", schemaPath: "#/properties/configuration/properties/seed/maximum", keyword: "maximum", params: { comparison: "<=", limit: 4294967295 }, message: "must be <= 4294967295" };
              if (vErrors === null) {
                vErrors = [err152];
              } else {
                vErrors.push(err152);
              }
              errors++;
            }
            if (data54 < 0 || isNaN(data54)) {
              const err153 = { instancePath: instancePath + "/configuration/seed", schemaPath: "#/properties/configuration/properties/seed/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
              if (vErrors === null) {
                vErrors = [err153];
              } else {
                vErrors.push(err153);
              }
              errors++;
            }
          }
        }
        if (data50.durationSec !== void 0) {
          let data55 = data50.durationSec;
          if (!(typeof data55 == "number" && (!(data55 % 1) && !isNaN(data55)))) {
            const err154 = { instancePath: instancePath + "/configuration/durationSec", schemaPath: "#/properties/configuration/properties/durationSec/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
              vErrors = [err154];
            } else {
              vErrors.push(err154);
            }
            errors++;
          }
          if (typeof data55 == "number") {
            if (data55 > 600 || isNaN(data55)) {
              const err155 = { instancePath: instancePath + "/configuration/durationSec", schemaPath: "#/properties/configuration/properties/durationSec/maximum", keyword: "maximum", params: { comparison: "<=", limit: 600 }, message: "must be <= 600" };
              if (vErrors === null) {
                vErrors = [err155];
              } else {
                vErrors.push(err155);
              }
              errors++;
            }
            if (data55 < 1 || isNaN(data55)) {
              const err156 = { instancePath: instancePath + "/configuration/durationSec", schemaPath: "#/properties/configuration/properties/durationSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
              if (vErrors === null) {
                vErrors = [err156];
              } else {
                vErrors.push(err156);
              }
              errors++;
            }
          }
        }
        if (data50.tickSec !== void 0) {
          let data56 = data50.tickSec;
          if (typeof data56 == "number") {
            if (data56 > 60 || isNaN(data56)) {
              const err157 = { instancePath: instancePath + "/configuration/tickSec", schemaPath: "#/properties/configuration/properties/tickSec/maximum", keyword: "maximum", params: { comparison: "<=", limit: 60 }, message: "must be <= 60" };
              if (vErrors === null) {
                vErrors = [err157];
              } else {
                vErrors.push(err157);
              }
              errors++;
            }
            if (data56 <= 0 || isNaN(data56)) {
              const err158 = { instancePath: instancePath + "/configuration/tickSec", schemaPath: "#/properties/configuration/properties/tickSec/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
              if (vErrors === null) {
                vErrors = [err158];
              } else {
                vErrors.push(err158);
              }
              errors++;
            }
          } else {
            const err159 = { instancePath: instancePath + "/configuration/tickSec", schemaPath: "#/properties/configuration/properties/tickSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err159];
            } else {
              vErrors.push(err159);
            }
            errors++;
          }
        }
        if (data50.loadMode !== void 0) {
          let data57 = data50.loadMode;
          if (typeof data57 !== "string") {
            const err160 = { instancePath: instancePath + "/configuration/loadMode", schemaPath: "#/properties/configuration/properties/loadMode/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err160];
            } else {
              vErrors.push(err160);
            }
            errors++;
          }
          if (!(data57 === "average" || data57 === "peak")) {
            const err161 = { instancePath: instancePath + "/configuration/loadMode", schemaPath: "#/properties/configuration/properties/loadMode/enum", keyword: "enum", params: { allowedValues: schema31.properties.configuration.properties.loadMode.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err161];
            } else {
              vErrors.push(err161);
            }
            errors++;
          }
        }
        if (data50.events !== void 0) {
          let data58 = data50.events;
          if (Array.isArray(data58)) {
            if (data58.length > 20) {
              const err162 = { instancePath: instancePath + "/configuration/events", schemaPath: "#/properties/configuration/properties/events/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" };
              if (vErrors === null) {
                vErrors = [err162];
              } else {
                vErrors.push(err162);
              }
              errors++;
            }
            const len9 = data58.length;
            for (let i9 = 0; i9 < len9; i9++) {
              let data59 = data58[i9];
              if (data59 && typeof data59 == "object" && !Array.isArray(data59)) {
                if (data59.id === void 0) {
                  const err163 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
                  if (vErrors === null) {
                    vErrors = [err163];
                  } else {
                    vErrors.push(err163);
                  }
                  errors++;
                }
                if (data59.type === void 0) {
                  const err164 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
                  if (vErrors === null) {
                    vErrors = [err164];
                  } else {
                    vErrors.push(err164);
                  }
                  errors++;
                }
                if (data59.targetKind === void 0) {
                  const err165 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "targetKind" }, message: "must have required property 'targetKind'" };
                  if (vErrors === null) {
                    vErrors = [err165];
                  } else {
                    vErrors.push(err165);
                  }
                  errors++;
                }
                if (data59.targetId === void 0) {
                  const err166 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "targetId" }, message: "must have required property 'targetId'" };
                  if (vErrors === null) {
                    vErrors = [err166];
                  } else {
                    vErrors.push(err166);
                  }
                  errors++;
                }
                if (data59.startSec === void 0) {
                  const err167 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "startSec" }, message: "must have required property 'startSec'" };
                  if (vErrors === null) {
                    vErrors = [err167];
                  } else {
                    vErrors.push(err167);
                  }
                  errors++;
                }
                if (data59.durationSec === void 0) {
                  const err168 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "durationSec" }, message: "must have required property 'durationSec'" };
                  if (vErrors === null) {
                    vErrors = [err168];
                  } else {
                    vErrors.push(err168);
                  }
                  errors++;
                }
                if (data59.magnitude === void 0) {
                  const err169 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "magnitude" }, message: "must have required property 'magnitude'" };
                  if (vErrors === null) {
                    vErrors = [err169];
                  } else {
                    vErrors.push(err169);
                  }
                  errors++;
                }
                if (data59.recoverySec === void 0) {
                  const err170 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/required", keyword: "required", params: { missingProperty: "recoverySec" }, message: "must have required property 'recoverySec'" };
                  if (vErrors === null) {
                    vErrors = [err170];
                  } else {
                    vErrors.push(err170);
                  }
                  errors++;
                }
                for (const key8 in data59) {
                  if (!func5.call(schema49.properties, key8)) {
                    const err171 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key8 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err171];
                    } else {
                      vErrors.push(err171);
                    }
                    errors++;
                  }
                }
                if (data59.id !== void 0) {
                  let data60 = data59.id;
                  if (typeof data60 === "string") {
                    if (!pattern4.test(data60)) {
                      const err172 = { instancePath: instancePath + "/configuration/events/" + i9 + "/id", schemaPath: "#/$defs/event/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err172];
                      } else {
                        vErrors.push(err172);
                      }
                      errors++;
                    }
                  } else {
                    const err173 = { instancePath: instancePath + "/configuration/events/" + i9 + "/id", schemaPath: "#/$defs/event/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err173];
                    } else {
                      vErrors.push(err173);
                    }
                    errors++;
                  }
                }
                if (data59.type !== void 0) {
                  let data61 = data59.type;
                  if (typeof data61 !== "string") {
                    const err174 = { instancePath: instancePath + "/configuration/events/" + i9 + "/type", schemaPath: "#/$defs/event/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err174];
                    } else {
                      vErrors.push(err174);
                    }
                    errors++;
                  }
                  if (!(data61 === "traffic-10x" || data61 === "traffic-100x" || data61 === "database-latency" || data61 === "database-unavailable" || data61 === "redis-unavailable" || data61 === "queue-backlog" || data61 === "network-latency" || data61 === "service-unavailable" || data61 === "region-failure" || data61 === "high-cpu" || data61 === "memory-pressure" || data61 === "traffic-spike")) {
                    const err175 = { instancePath: instancePath + "/configuration/events/" + i9 + "/type", schemaPath: "#/$defs/event/properties/type/enum", keyword: "enum", params: { allowedValues: schema49.properties.type.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                      vErrors = [err175];
                    } else {
                      vErrors.push(err175);
                    }
                    errors++;
                  }
                }
                if (data59.targetKind !== void 0) {
                  let data62 = data59.targetKind;
                  if (typeof data62 !== "string") {
                    const err176 = { instancePath: instancePath + "/configuration/events/" + i9 + "/targetKind", schemaPath: "#/$defs/event/properties/targetKind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err176];
                    } else {
                      vErrors.push(err176);
                    }
                    errors++;
                  }
                  if (!(data62 === "global" || data62 === "node" || data62 === "edge" || data62 === "region" || data62 === "workload" || data62 === "instance")) {
                    const err177 = { instancePath: instancePath + "/configuration/events/" + i9 + "/targetKind", schemaPath: "#/$defs/event/properties/targetKind/enum", keyword: "enum", params: { allowedValues: schema49.properties.targetKind.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                      vErrors = [err177];
                    } else {
                      vErrors.push(err177);
                    }
                    errors++;
                  }
                }
                if (data59.targetId !== void 0) {
                  let data63 = data59.targetId;
                  if (typeof data63 === "string") {
                    if (!pattern4.test(data63)) {
                      const err178 = { instancePath: instancePath + "/configuration/events/" + i9 + "/targetId", schemaPath: "#/$defs/event/properties/targetId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err178];
                      } else {
                        vErrors.push(err178);
                      }
                      errors++;
                    }
                  } else {
                    const err179 = { instancePath: instancePath + "/configuration/events/" + i9 + "/targetId", schemaPath: "#/$defs/event/properties/targetId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err179];
                    } else {
                      vErrors.push(err179);
                    }
                    errors++;
                  }
                }
                if (data59.startSec !== void 0) {
                  let data64 = data59.startSec;
                  if (typeof data64 == "number") {
                    if (data64 < 0 || isNaN(data64)) {
                      const err180 = { instancePath: instancePath + "/configuration/events/" + i9 + "/startSec", schemaPath: "#/$defs/event/properties/startSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err180];
                      } else {
                        vErrors.push(err180);
                      }
                      errors++;
                    }
                  } else {
                    const err181 = { instancePath: instancePath + "/configuration/events/" + i9 + "/startSec", schemaPath: "#/$defs/event/properties/startSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err181];
                    } else {
                      vErrors.push(err181);
                    }
                    errors++;
                  }
                }
                if (data59.durationSec !== void 0) {
                  let data65 = data59.durationSec;
                  if (typeof data65 == "number") {
                    if (data65 <= 0 || isNaN(data65)) {
                      const err182 = { instancePath: instancePath + "/configuration/events/" + i9 + "/durationSec", schemaPath: "#/$defs/event/properties/durationSec/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
                      if (vErrors === null) {
                        vErrors = [err182];
                      } else {
                        vErrors.push(err182);
                      }
                      errors++;
                    }
                  } else {
                    const err183 = { instancePath: instancePath + "/configuration/events/" + i9 + "/durationSec", schemaPath: "#/$defs/event/properties/durationSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err183];
                    } else {
                      vErrors.push(err183);
                    }
                    errors++;
                  }
                }
                if (data59.magnitude !== void 0) {
                  let data66 = data59.magnitude;
                  if (typeof data66 == "number") {
                    if (data66 < 0 || isNaN(data66)) {
                      const err184 = { instancePath: instancePath + "/configuration/events/" + i9 + "/magnitude", schemaPath: "#/$defs/event/properties/magnitude/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err184];
                      } else {
                        vErrors.push(err184);
                      }
                      errors++;
                    }
                  } else {
                    const err185 = { instancePath: instancePath + "/configuration/events/" + i9 + "/magnitude", schemaPath: "#/$defs/event/properties/magnitude/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err185];
                    } else {
                      vErrors.push(err185);
                    }
                    errors++;
                  }
                }
                if (data59.recoverySec !== void 0) {
                  let data67 = data59.recoverySec;
                  if (typeof data67 == "number") {
                    if (data67 < 0 || isNaN(data67)) {
                      const err186 = { instancePath: instancePath + "/configuration/events/" + i9 + "/recoverySec", schemaPath: "#/$defs/event/properties/recoverySec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err186];
                      } else {
                        vErrors.push(err186);
                      }
                      errors++;
                    }
                  } else {
                    const err187 = { instancePath: instancePath + "/configuration/events/" + i9 + "/recoverySec", schemaPath: "#/$defs/event/properties/recoverySec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err187];
                    } else {
                      vErrors.push(err187);
                    }
                    errors++;
                  }
                }
                if (data59.backlogAgeSec !== void 0) {
                  let data68 = data59.backlogAgeSec;
                  if (typeof data68 == "number") {
                    if (data68 < 0 || isNaN(data68)) {
                      const err188 = { instancePath: instancePath + "/configuration/events/" + i9 + "/backlogAgeSec", schemaPath: "#/$defs/event/properties/backlogAgeSec/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                      if (vErrors === null) {
                        vErrors = [err188];
                      } else {
                        vErrors.push(err188);
                      }
                      errors++;
                    }
                  } else {
                    const err189 = { instancePath: instancePath + "/configuration/events/" + i9 + "/backlogAgeSec", schemaPath: "#/$defs/event/properties/backlogAgeSec/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err189];
                    } else {
                      vErrors.push(err189);
                    }
                    errors++;
                  }
                }
              } else {
                const err190 = { instancePath: instancePath + "/configuration/events/" + i9, schemaPath: "#/$defs/event/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err190];
                } else {
                  vErrors.push(err190);
                }
                errors++;
              }
            }
          } else {
            const err191 = { instancePath: instancePath + "/configuration/events", schemaPath: "#/properties/configuration/properties/events/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err191];
            } else {
              vErrors.push(err191);
            }
            errors++;
          }
        }
      } else {
        const err192 = { instancePath: instancePath + "/configuration", schemaPath: "#/properties/configuration/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err192];
        } else {
          vErrors.push(err192);
        }
        errors++;
      }
    }
    if (data.layout !== void 0) {
      let data69 = data.layout;
      if (data69 && typeof data69 == "object" && !Array.isArray(data69)) {
        if (data69.positions === void 0) {
          const err193 = { instancePath: instancePath + "/layout", schemaPath: "#/properties/layout/required", keyword: "required", params: { missingProperty: "positions" }, message: "must have required property 'positions'" };
          if (vErrors === null) {
            vErrors = [err193];
          } else {
            vErrors.push(err193);
          }
          errors++;
        }
        if (data69.groups === void 0) {
          const err194 = { instancePath: instancePath + "/layout", schemaPath: "#/properties/layout/required", keyword: "required", params: { missingProperty: "groups" }, message: "must have required property 'groups'" };
          if (vErrors === null) {
            vErrors = [err194];
          } else {
            vErrors.push(err194);
          }
          errors++;
        }
        if (data69.viewport === void 0) {
          const err195 = { instancePath: instancePath + "/layout", schemaPath: "#/properties/layout/required", keyword: "required", params: { missingProperty: "viewport" }, message: "must have required property 'viewport'" };
          if (vErrors === null) {
            vErrors = [err195];
          } else {
            vErrors.push(err195);
          }
          errors++;
        }
        for (const key9 in data69) {
          if (!(key9 === "positions" || key9 === "groups" || key9 === "viewport")) {
            const err196 = { instancePath: instancePath + "/layout", schemaPath: "#/properties/layout/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key9 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err196];
            } else {
              vErrors.push(err196);
            }
            errors++;
          }
        }
        if (data69.positions !== void 0) {
          let data70 = data69.positions;
          if (Array.isArray(data70)) {
            if (data70.length > 100) {
              const err197 = { instancePath: instancePath + "/layout/positions", schemaPath: "#/properties/layout/properties/positions/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
              if (vErrors === null) {
                vErrors = [err197];
              } else {
                vErrors.push(err197);
              }
              errors++;
            }
            const len10 = data70.length;
            for (let i10 = 0; i10 < len10; i10++) {
              let data71 = data70[i10];
              if (data71 && typeof data71 == "object" && !Array.isArray(data71)) {
                if (data71.nodeId === void 0) {
                  const err198 = { instancePath: instancePath + "/layout/positions/" + i10, schemaPath: "#/$defs/position/required", keyword: "required", params: { missingProperty: "nodeId" }, message: "must have required property 'nodeId'" };
                  if (vErrors === null) {
                    vErrors = [err198];
                  } else {
                    vErrors.push(err198);
                  }
                  errors++;
                }
                if (data71.x === void 0) {
                  const err199 = { instancePath: instancePath + "/layout/positions/" + i10, schemaPath: "#/$defs/position/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
                  if (vErrors === null) {
                    vErrors = [err199];
                  } else {
                    vErrors.push(err199);
                  }
                  errors++;
                }
                if (data71.y === void 0) {
                  const err200 = { instancePath: instancePath + "/layout/positions/" + i10, schemaPath: "#/$defs/position/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
                  if (vErrors === null) {
                    vErrors = [err200];
                  } else {
                    vErrors.push(err200);
                  }
                  errors++;
                }
                for (const key10 in data71) {
                  if (!(key10 === "nodeId" || key10 === "x" || key10 === "y" || key10 === "groupId")) {
                    const err201 = { instancePath: instancePath + "/layout/positions/" + i10, schemaPath: "#/$defs/position/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key10 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err201];
                    } else {
                      vErrors.push(err201);
                    }
                    errors++;
                  }
                }
                if (data71.nodeId !== void 0) {
                  let data72 = data71.nodeId;
                  if (typeof data72 === "string") {
                    if (!pattern4.test(data72)) {
                      const err202 = { instancePath: instancePath + "/layout/positions/" + i10 + "/nodeId", schemaPath: "#/$defs/position/properties/nodeId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err202];
                      } else {
                        vErrors.push(err202);
                      }
                      errors++;
                    }
                  } else {
                    const err203 = { instancePath: instancePath + "/layout/positions/" + i10 + "/nodeId", schemaPath: "#/$defs/position/properties/nodeId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err203];
                    } else {
                      vErrors.push(err203);
                    }
                    errors++;
                  }
                }
                if (data71.x !== void 0) {
                  if (!(typeof data71.x == "number")) {
                    const err204 = { instancePath: instancePath + "/layout/positions/" + i10 + "/x", schemaPath: "#/$defs/position/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err204];
                    } else {
                      vErrors.push(err204);
                    }
                    errors++;
                  }
                }
                if (data71.y !== void 0) {
                  if (!(typeof data71.y == "number")) {
                    const err205 = { instancePath: instancePath + "/layout/positions/" + i10 + "/y", schemaPath: "#/$defs/position/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                      vErrors = [err205];
                    } else {
                      vErrors.push(err205);
                    }
                    errors++;
                  }
                }
                if (data71.groupId !== void 0) {
                  let data75 = data71.groupId;
                  if (typeof data75 === "string") {
                    if (!pattern4.test(data75)) {
                      const err206 = { instancePath: instancePath + "/layout/positions/" + i10 + "/groupId", schemaPath: "#/$defs/position/properties/groupId/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err206];
                      } else {
                        vErrors.push(err206);
                      }
                      errors++;
                    }
                  } else {
                    const err207 = { instancePath: instancePath + "/layout/positions/" + i10 + "/groupId", schemaPath: "#/$defs/position/properties/groupId/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err207];
                    } else {
                      vErrors.push(err207);
                    }
                    errors++;
                  }
                }
              } else {
                const err208 = { instancePath: instancePath + "/layout/positions/" + i10, schemaPath: "#/$defs/position/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err208];
                } else {
                  vErrors.push(err208);
                }
                errors++;
              }
            }
          } else {
            const err209 = { instancePath: instancePath + "/layout/positions", schemaPath: "#/properties/layout/properties/positions/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err209];
            } else {
              vErrors.push(err209);
            }
            errors++;
          }
        }
        if (data69.groups !== void 0) {
          let data76 = data69.groups;
          if (Array.isArray(data76)) {
            if (data76.length > 100) {
              const err210 = { instancePath: instancePath + "/layout/groups", schemaPath: "#/properties/layout/properties/groups/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
              if (vErrors === null) {
                vErrors = [err210];
              } else {
                vErrors.push(err210);
              }
              errors++;
            }
            const len11 = data76.length;
            for (let i11 = 0; i11 < len11; i11++) {
              let data77 = data76[i11];
              if (data77 && typeof data77 == "object" && !Array.isArray(data77)) {
                if (data77.id === void 0) {
                  const err211 = { instancePath: instancePath + "/layout/groups/" + i11, schemaPath: "#/$defs/group/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
                  if (vErrors === null) {
                    vErrors = [err211];
                  } else {
                    vErrors.push(err211);
                  }
                  errors++;
                }
                if (data77.name === void 0) {
                  const err212 = { instancePath: instancePath + "/layout/groups/" + i11, schemaPath: "#/$defs/group/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
                  if (vErrors === null) {
                    vErrors = [err212];
                  } else {
                    vErrors.push(err212);
                  }
                  errors++;
                }
                if (data77.nodeIds === void 0) {
                  const err213 = { instancePath: instancePath + "/layout/groups/" + i11, schemaPath: "#/$defs/group/required", keyword: "required", params: { missingProperty: "nodeIds" }, message: "must have required property 'nodeIds'" };
                  if (vErrors === null) {
                    vErrors = [err213];
                  } else {
                    vErrors.push(err213);
                  }
                  errors++;
                }
                for (const key11 in data77) {
                  if (!(key11 === "id" || key11 === "name" || key11 === "nodeIds")) {
                    const err214 = { instancePath: instancePath + "/layout/groups/" + i11, schemaPath: "#/$defs/group/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key11 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err214];
                    } else {
                      vErrors.push(err214);
                    }
                    errors++;
                  }
                }
                if (data77.id !== void 0) {
                  let data78 = data77.id;
                  if (typeof data78 === "string") {
                    if (!pattern4.test(data78)) {
                      const err215 = { instancePath: instancePath + "/layout/groups/" + i11 + "/id", schemaPath: "#/$defs/group/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                      if (vErrors === null) {
                        vErrors = [err215];
                      } else {
                        vErrors.push(err215);
                      }
                      errors++;
                    }
                  } else {
                    const err216 = { instancePath: instancePath + "/layout/groups/" + i11 + "/id", schemaPath: "#/$defs/group/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err216];
                    } else {
                      vErrors.push(err216);
                    }
                    errors++;
                  }
                }
                if (data77.name !== void 0) {
                  let data79 = data77.name;
                  if (typeof data79 === "string") {
                    if (func1(data79) > 120) {
                      const err217 = { instancePath: instancePath + "/layout/groups/" + i11 + "/name", schemaPath: "#/$defs/group/properties/name/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
                      if (vErrors === null) {
                        vErrors = [err217];
                      } else {
                        vErrors.push(err217);
                      }
                      errors++;
                    }
                    if (func1(data79) < 1) {
                      const err218 = { instancePath: instancePath + "/layout/groups/" + i11 + "/name", schemaPath: "#/$defs/group/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                      if (vErrors === null) {
                        vErrors = [err218];
                      } else {
                        vErrors.push(err218);
                      }
                      errors++;
                    }
                  } else {
                    const err219 = { instancePath: instancePath + "/layout/groups/" + i11 + "/name", schemaPath: "#/$defs/group/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err219];
                    } else {
                      vErrors.push(err219);
                    }
                    errors++;
                  }
                }
                if (data77.nodeIds !== void 0) {
                  let data80 = data77.nodeIds;
                  if (Array.isArray(data80)) {
                    if (data80.length > 100) {
                      const err220 = { instancePath: instancePath + "/layout/groups/" + i11 + "/nodeIds", schemaPath: "#/$defs/group/properties/nodeIds/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" };
                      if (vErrors === null) {
                        vErrors = [err220];
                      } else {
                        vErrors.push(err220);
                      }
                      errors++;
                    }
                    const len12 = data80.length;
                    for (let i12 = 0; i12 < len12; i12++) {
                      let data81 = data80[i12];
                      if (typeof data81 === "string") {
                        if (!pattern4.test(data81)) {
                          const err221 = { instancePath: instancePath + "/layout/groups/" + i11 + "/nodeIds/" + i12, schemaPath: "#/$defs/group/properties/nodeIds/items/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$" }, message: 'must match pattern "^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,119}$"' };
                          if (vErrors === null) {
                            vErrors = [err221];
                          } else {
                            vErrors.push(err221);
                          }
                          errors++;
                        }
                      } else {
                        const err222 = { instancePath: instancePath + "/layout/groups/" + i11 + "/nodeIds/" + i12, schemaPath: "#/$defs/group/properties/nodeIds/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err222];
                        } else {
                          vErrors.push(err222);
                        }
                        errors++;
                      }
                    }
                  } else {
                    const err223 = { instancePath: instancePath + "/layout/groups/" + i11 + "/nodeIds", schemaPath: "#/$defs/group/properties/nodeIds/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                      vErrors = [err223];
                    } else {
                      vErrors.push(err223);
                    }
                    errors++;
                  }
                }
              } else {
                const err224 = { instancePath: instancePath + "/layout/groups/" + i11, schemaPath: "#/$defs/group/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err224];
                } else {
                  vErrors.push(err224);
                }
                errors++;
              }
            }
          } else {
            const err225 = { instancePath: instancePath + "/layout/groups", schemaPath: "#/properties/layout/properties/groups/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
              vErrors = [err225];
            } else {
              vErrors.push(err225);
            }
            errors++;
          }
        }
        if (data69.viewport !== void 0) {
          let data82 = data69.viewport;
          if (data82 && typeof data82 == "object" && !Array.isArray(data82)) {
            if (data82.x === void 0) {
              const err226 = { instancePath: instancePath + "/layout/viewport", schemaPath: "#/properties/layout/properties/viewport/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
              if (vErrors === null) {
                vErrors = [err226];
              } else {
                vErrors.push(err226);
              }
              errors++;
            }
            if (data82.y === void 0) {
              const err227 = { instancePath: instancePath + "/layout/viewport", schemaPath: "#/properties/layout/properties/viewport/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
              if (vErrors === null) {
                vErrors = [err227];
              } else {
                vErrors.push(err227);
              }
              errors++;
            }
            if (data82.zoom === void 0) {
              const err228 = { instancePath: instancePath + "/layout/viewport", schemaPath: "#/properties/layout/properties/viewport/required", keyword: "required", params: { missingProperty: "zoom" }, message: "must have required property 'zoom'" };
              if (vErrors === null) {
                vErrors = [err228];
              } else {
                vErrors.push(err228);
              }
              errors++;
            }
            for (const key12 in data82) {
              if (!(key12 === "x" || key12 === "y" || key12 === "zoom")) {
                const err229 = { instancePath: instancePath + "/layout/viewport", schemaPath: "#/properties/layout/properties/viewport/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key12 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err229];
                } else {
                  vErrors.push(err229);
                }
                errors++;
              }
            }
            if (data82.x !== void 0) {
              if (!(typeof data82.x == "number")) {
                const err230 = { instancePath: instancePath + "/layout/viewport/x", schemaPath: "#/properties/layout/properties/viewport/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err230];
                } else {
                  vErrors.push(err230);
                }
                errors++;
              }
            }
            if (data82.y !== void 0) {
              if (!(typeof data82.y == "number")) {
                const err231 = { instancePath: instancePath + "/layout/viewport/y", schemaPath: "#/properties/layout/properties/viewport/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err231];
                } else {
                  vErrors.push(err231);
                }
                errors++;
              }
            }
            if (data82.zoom !== void 0) {
              let data85 = data82.zoom;
              if (typeof data85 == "number") {
                if (data85 > 2 || isNaN(data85)) {
                  const err232 = { instancePath: instancePath + "/layout/viewport/zoom", schemaPath: "#/properties/layout/properties/viewport/properties/zoom/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2 }, message: "must be <= 2" };
                  if (vErrors === null) {
                    vErrors = [err232];
                  } else {
                    vErrors.push(err232);
                  }
                  errors++;
                }
                if (data85 < 0.25 || isNaN(data85)) {
                  const err233 = { instancePath: instancePath + "/layout/viewport/zoom", schemaPath: "#/properties/layout/properties/viewport/properties/zoom/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0.25 }, message: "must be >= 0.25" };
                  if (vErrors === null) {
                    vErrors = [err233];
                  } else {
                    vErrors.push(err233);
                  }
                  errors++;
                }
              } else {
                const err234 = { instancePath: instancePath + "/layout/viewport/zoom", schemaPath: "#/properties/layout/properties/viewport/properties/zoom/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err234];
                } else {
                  vErrors.push(err234);
                }
                errors++;
              }
            }
          } else {
            const err235 = { instancePath: instancePath + "/layout/viewport", schemaPath: "#/properties/layout/properties/viewport/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err235];
            } else {
              vErrors.push(err235);
            }
            errors++;
          }
        }
      } else {
        const err236 = { instancePath: instancePath + "/layout", schemaPath: "#/properties/layout/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err236];
        } else {
          vErrors.push(err236);
        }
        errors++;
      }
    }
  } else {
    const err237 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err237];
    } else {
      vErrors.push(err237);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validateArchitecture(doc) {
  if (!validate20(doc)) {
    return (validate20.errors ?? []).map((e) => ({
      code: "schema",
      path: e.instancePath,
      message: e.message ?? "invalid"
    }));
  }
  const d = doc;
  const out = [];
  const dup = (kind, ids) => {
    const seen = /* @__PURE__ */ new Set();
    for (const id of ids) {
      if (seen.has(id)) out.push({ code: "duplicate-id", path: kind, message: `${kind}: id duplicado ${id}` });
      seen.add(id);
    }
  };
  dup("nodes", d.nodes.map((n) => n.id));
  dup("edges", d.edges.map((e) => e.id));
  const nodeIds = new Set(d.nodes.map((n) => n.id));
  const edges2 = new Map(d.edges.map((e) => [e.id, e]));
  for (const e of d.edges) {
    for (const end of ["source", "target"]) {
      if (!nodeIds.has(e[end])) out.push({ code: "dangling-edge", path: `edges/${e.id}`, message: `${end} inexistente: ${e[end]}` });
    }
  }
  for (const f of d.traffic.flows) {
    const steps = new Map(f.steps.map((s) => [s.id, s]));
    for (const s of f.steps) {
      const p = `flows/${f.id}/${s.id}`;
      if (!nodeIds.has(s.nodeId)) out.push({ code: "dangling-node", path: p, message: `nó inexistente ${s.nodeId}` });
      if (s.parentStepId) {
        const parent = steps.get(s.parentStepId);
        const edge = edges2.get(s.edgeId);
        if (!parent) out.push({ code: "dangling-parent", path: p, message: `parent inexistente ${s.parentStepId}` });
        else if (!edge) out.push({ code: "dangling-edge", path: p, message: `edgeId inexistente ${s.edgeId}` });
        else if (edge.source !== parent.nodeId || edge.target !== s.nodeId)
          out.push({ code: "edge-mismatch", path: p, message: `edge ${s.edgeId} não liga ${parent.nodeId}→${s.nodeId}` });
      }
    }
    const state = /* @__PURE__ */ new Map();
    const visit = (id) => {
      if (state.get(id) === 1) return true;
      if (state.get(id) === 2) return false;
      state.set(id, 1);
      const s = steps.get(id);
      for (const dep of [s?.parentStepId, s?.conditionStepId]) if (dep && steps.has(dep) && visit(dep)) return true;
      state.set(id, 2);
      return false;
    };
    for (const id of steps.keys()) if (visit(id)) {
      out.push({ code: "cycle", path: `flows/${f.id}`, message: "ciclo operacional no flow" });
      break;
    }
  }
  return out;
}
const L = (base, p95, max) => ({ base, p95, max });
const DEFAULT_LAT = L(5, 10, 500);
const PROFILES = {
  "source-v1": { id: "source-v1", capacity: {}, source: true },
  "lb-standard-v1": { id: "lb-standard-v1", capacity: { compute: 2e4 }, credits: 80, lat: L(2, 3, 200) },
  "compute-standard-v1": { id: "compute-standard-v1", capacity: { compute: 3e3, job: 1500 }, consumerClass: "job", credits: 80, lat: L(5, 10, 500) },
  "worker-standard-v1": { id: "worker-standard-v1", capacity: { compute: 1e3, job: 500 }, consumerClass: "job" },
  "cache-standard-v1": { id: "cache-standard-v1", capacity: { read: 2e4, write: 1e4 }, credits: 80, lat: L(1, 2, 200) },
  "sql-standard-v1": { id: "sql-standard-v1", capacity: { read: 2e3, write: 500 }, credits: 300, lat: L(5, 10, 500) },
  "nosql-standard-v1": { id: "nosql-standard-v1", capacity: { read: 5e3, write: 2e3 } },
  "queue-standard-v1": { id: "queue-standard-v1", capacity: { message: 1e4 } },
  "log-standard-v1": { id: "log-standard-v1", capacity: { message: 5e4 } },
  "cdn-standard-v1": { id: "cdn-standard-v1", capacity: { read: 1e5 } },
  "objstore-standard-v1": { id: "objstore-standard-v1", capacity: { read: 5e3, write: 1e3 } },
  "search-standard-v1": { id: "search-standard-v1", capacity: { read: 3e3, write: 500 } },
  "ws-standard-v1": { id: "ws-standard-v1", capacity: { message: 2e4, compute: 2e4 } },
  "dns-standard-v1": { id: "dns-standard-v1", capacity: { compute: 5e4 } },
  "auth-standard-v1": { id: "auth-standard-v1", capacity: { compute: 2e3 } },
  "notify-standard-v1": { id: "notify-standard-v1", capacity: { message: 1e3, compute: 1500 }, consumerClass: "message" },
  // ── ampliação: IoT, plataforma de contêineres, serverless, dados especializados e apoio (valores de ensino, não benchmarks) ──
  "iot-gateway-v1": { id: "iot-gateway-v1", capacity: { compute: 8e3, message: 2e4 }, consumerClass: "message", credits: 60, lat: L(3, 6, 300) },
  "mqtt-broker-v1": { id: "mqtt-broker-v1", capacity: { message: 1e5 }, credits: 120, lat: L(1, 3, 200) },
  "iot-platform-v1": { id: "iot-platform-v1", capacity: { compute: 6e3, message: 3e4 }, consumerClass: "message", credits: 200, lat: L(8, 20, 500) },
  "edge-compute-v1": { id: "edge-compute-v1", capacity: { compute: 600, job: 300 }, consumerClass: "job", credits: 40, lat: L(6, 12, 500) },
  "waf-standard-v1": { id: "waf-standard-v1", capacity: { compute: 3e4 }, credits: 100, lat: L(2, 4, 200) },
  "mesh-standard-v1": { id: "mesh-standard-v1", capacity: { compute: 3e4 }, credits: 40, lat: L(1, 2, 100) },
  "k8s-cluster-v1": { id: "k8s-cluster-v1", capacity: { compute: 12e3, job: 6e3 }, consumerClass: "job", credits: 400, lat: L(5, 10, 500) },
  "serverless-v1": { id: "serverless-v1", capacity: { compute: 1e3, job: 1e3 }, consumerClass: "job", credits: 30, lat: L(20, 80, 800) },
  "vm-standard-v1": { id: "vm-standard-v1", capacity: { compute: 4e3, job: 2e3 }, consumerClass: "job", credits: 120, lat: L(5, 10, 500) },
  "scheduler-v1": { id: "scheduler-v1", capacity: { compute: 5e3, job: 2e3 }, consumerClass: "job", credits: 20, lat: L(5, 10, 300) },
  "stream-proc-v1": { id: "stream-proc-v1", capacity: { message: 4e4, job: 2e4, compute: 2e4 }, consumerClass: "message", credits: 300, lat: L(10, 25, 800) },
  "batch-proc-v1": { id: "batch-proc-v1", capacity: { job: 2e3, compute: 2e3 }, consumerClass: "job", credits: 350, lat: L(40, 150, 2e3) },
  "ml-infer-v1": { id: "ml-infer-v1", capacity: { compute: 200, job: 100 }, consumerClass: "job", credits: 900, lat: L(30, 80, 1e3) },
  "workflow-v1": { id: "workflow-v1", capacity: { compute: 2e3, job: 1e3 }, consumerClass: "job", credits: 150, lat: L(8, 20, 500) },
  "tsdb-standard-v1": { id: "tsdb-standard-v1", capacity: { read: 8e3, write: 2e4 }, credits: 250, lat: L(5, 12, 500) },
  "graph-standard-v1": { id: "graph-standard-v1", capacity: { read: 3e3, write: 800 }, credits: 300, lat: L(8, 20, 600) },
  "vector-standard-v1": { id: "vector-standard-v1", capacity: { read: 1500, write: 400 }, credits: 350, lat: L(8, 20, 600) },
  "warehouse-v1": { id: "warehouse-v1", capacity: { read: 200, write: 5e3 }, credits: 800, lat: L(50, 200, 3e3) },
  "eventbus-standard-v1": { id: "eventbus-standard-v1", capacity: { message: 2e4 }, credits: 60, lat: L(5, 15, 300) },
  "secrets-v1": { id: "secrets-v1", capacity: { compute: 5e3 }, credits: 20, lat: L(3, 8, 300) },
  "discovery-v1": { id: "discovery-v1", capacity: { compute: 2e4 }, credits: 40, lat: L(1, 3, 200) },
  "observability-v1": { id: "observability-v1", capacity: { message: 1e5, compute: 8e3 }, credits: 250, lat: L(10, 30, 800) },
  "payment-ext-v1": { id: "payment-ext-v1", capacity: { compute: 800 }, lat: L(40, 120, 2e3) },
  "external-api-v1": { id: "external-api-v1", capacity: { compute: 1e3 }, lat: L(30, 100, 1500) },
  "ratelimit-v1": { id: "ratelimit-v1", capacity: { compute: 5e4 }, credits: 30, lat: L(1, 2, 100) }
};
const DEFAULT_PROFILE_BY_TYPE = {
  client: "source-v1",
  "web-app": "source-v1",
  "mobile-app": "source-v1",
  "iot-device": "source-v1",
  "external-system": "source-v1",
  "api-gateway": "lb-standard-v1",
  "load-balancer": "lb-standard-v1",
  backend: "compute-standard-v1",
  microservice: "compute-standard-v1",
  worker: "worker-standard-v1",
  database: null,
  "sql-database": "sql-standard-v1",
  "nosql-database": "nosql-standard-v1",
  redis: "cache-standard-v1",
  kafka: "log-standard-v1",
  queue: "queue-standard-v1",
  cdn: "cdn-standard-v1",
  "object-storage": "objstore-standard-v1",
  "search-engine": "search-standard-v1",
  websocket: "ws-standard-v1",
  dns: "dns-standard-v1",
  "authentication-service": "auth-standard-v1",
  "notification-service": "notify-standard-v1",
  "iot-gateway": "iot-gateway-v1",
  "mqtt-broker": "mqtt-broker-v1",
  "iot-platform": "iot-platform-v1",
  "edge-compute": "edge-compute-v1",
  waf: "waf-standard-v1",
  "service-mesh": "mesh-standard-v1",
  container: "compute-standard-v1",
  kubernetes: "k8s-cluster-v1",
  serverless: "serverless-v1",
  vm: "vm-standard-v1",
  scheduler: "scheduler-v1",
  "stream-processor": "stream-proc-v1",
  "batch-processor": "batch-proc-v1",
  "ml-service": "ml-infer-v1",
  "workflow-engine": "workflow-v1",
  "timeseries-db": "tsdb-standard-v1",
  "graph-db": "graph-standard-v1",
  "vector-db": "vector-standard-v1",
  "data-warehouse": "warehouse-v1",
  "event-bus": "eventbus-standard-v1",
  "secrets-manager": "secrets-v1",
  "service-discovery": "discovery-v1",
  observability: "observability-v1",
  "payment-gateway": "payment-ext-v1",
  "third-party-api": "external-api-v1",
  "rate-limiter": "ratelimit-v1"
};
const QUEUE_TYPES = /* @__PURE__ */ new Set(["queue", "kafka", "mqtt-broker", "event-bus"]);
const MAX_BUCKETS = 48;
function tidy(bs) {
  const m = /* @__PURE__ */ new Map();
  for (const b of bs) if (b.w > 1e-12) {
    const k = Math.round(b.lat * 10) / 10;
    m.set(k, (m.get(k) ?? 0) + b.w);
  }
  let out = [...m.entries()].sort((a, b) => a[0] - b[0]).map(([lat, w]) => ({ lat, w }));
  while (out.length > MAX_BUCKETS) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < out.length - 1; i++) {
      const d = out[i + 1].lat - out[i].lat;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    const a = out[bi], b = out[bi + 1];
    const w = a.w + b.w;
    out.splice(bi, 2, { lat: b.lat, w });
  }
  return out;
}
const serial = (a, b) => tidy(a.flatMap((x) => b.map((y) => ({ lat: x.lat + y.lat, w: x.w * y.w }))));
const parallel = (a, b) => tidy(a.flatMap((x) => b.map((y) => ({ lat: Math.max(x.lat, y.lat), w: x.w * y.w }))));
function solveDemand(doc, opts) {
  const nodes2 = new Map(doc.nodes.map((n) => [n.id, n]));
  const edgeById = new Map(doc.edges.map((e) => [e.id, e]));
  const inactive = new Set(opts.inactiveNodeIds ?? []);
  const flows = doc.traffic.flows;
  const nodeEff = (id) => opts.effects?.nodes?.[id] ?? {};
  const edgeEff = (id) => opts.effects?.edges?.[id] ?? {};
  const isDown = (id) => inactive.has(id) || !!nodeEff(id).unavailable;
  const orderOf = (steps) => {
    const done = /* @__PURE__ */ new Set();
    const order = [];
    const place = (s) => {
      if (done.has(s.id)) return;
      for (const dep of [s.parentStepId, s.conditionStepId]) {
        const d = steps.find((x) => x.id === dep);
        if (d) place(d);
      }
      done.add(s.id);
      order.push(s);
    };
    steps.forEach(place);
    return order;
  };
  const ordered = flows.map((f) => ({ flow: f, order: orderOf(f.steps) }));
  const profileOf = (id) => PROFILES[nodes2.get(id)?.properties?.profileId];
  const replicasOf = (id) => isDown(id) ? 0 : nodes2.get(id)?.properties?.replicas ?? 1;
  const capFactor = (id) => Math.max(0, nodeEff(id).capacityFactor ?? 1);
  const consumersOf = /* @__PURE__ */ new Map();
  for (const n of nodes2.values()) {
    if (QUEUE_TYPES.has(n.type)) {
      consumersOf.set(n.id, doc.edges.filter((e) => e.source === n.id && nodes2.has(e.target)).map((e) => e.target));
    }
  }
  let ratio = /* @__PURE__ */ new Map();
  let result = /* @__PURE__ */ new Map();
  for (let iter = 0; iter < 20; iter++) {
    const classLoad = /* @__PURE__ */ new Map();
    const offeredTotal = /* @__PURE__ */ new Map();
    const admittedTotal = /* @__PURE__ */ new Map();
    const add = (nodeId, cls, v, adm) => {
      const c = classLoad.get(nodeId) ?? {};
      c[cls] = (c[cls] ?? 0) + v;
      classLoad.set(nodeId, c);
      offeredTotal.set(nodeId, (offeredTotal.get(nodeId) ?? 0) + v);
      admittedTotal.set(nodeId, (admittedTotal.get(nodeId) ?? 0) + adm);
    };
    for (const { flow, order } of ordered) {
      const rootRps = opts.rps * (opts.weights?.[flow.id] ?? 1);
      const admittedStep = /* @__PURE__ */ new Map();
      for (const s of order) {
        let offered;
        if (!s.parentStepId) offered = rootRps;
        else if (!edgeById.has(s.edgeId)) offered = 0;
        else {
          let share = s.branchShare;
          if (s.condition === "cache-miss" || s.condition === "cache-hit") {
            const lookup = flow.steps.find((x) => x.id === s.conditionStepId);
            const cacheNode = lookup && nodes2.get(lookup.nodeId);
            const hit = cacheNode?.properties?.cache?.hitRate ?? 0;
            const down = lookup ? isDown(lookup.nodeId) : false;
            const missShare = down ? cacheNode?.properties?.cache?.failureMode === "bypass" ? 1 : 0 : 1 - hit;
            share = s.condition === "cache-miss" ? missShare : down ? 0 : hit;
          }
          offered = (admittedStep.get(s.parentStepId) ?? 0) * s.visitsPerRequest * share * (1 - (edgeEff(s.edgeId).dropRate ?? 0));
        }
        const adm = offered * (ratio.get(s.nodeId) ?? 1);
        admittedStep.set(s.id, adm);
        add(s.nodeId, s.operationClass, offered, adm);
      }
    }
    const queueStats = /* @__PURE__ */ new Map();
    for (const [qid, consumers] of consumersOf) {
      const enq = admittedTotal.get(qid) ?? 0;
      let capSum = 0;
      for (const cid of consumers) {
        const p = profileOf(cid);
        const cls = p?.consumerClass ?? "compute";
        capSum += (p?.capacity[cls] ?? 0) * replicasOf(cid) * capFactor(cid);
      }
      const consumed = Math.min(enq, capSum);
      const backlog = Math.max(0, Number(nodes2.get(qid)?.properties?.queue?.backlog ?? 0)) || 0;
      const slack = capSum - enq;
      queueStats.set(qid, {
        enqueued: enq,
        consumed,
        consumers: consumers.length,
        consumerCapacity: capSum,
        backlogGrowthPerSec: enq - consumed,
        backlog,
        drainSeconds: backlog === 0 ? 0 : slack > 1e-9 ? backlog / slack : null
      });
      for (const cid of consumers) {
        const cls = profileOf(cid)?.consumerClass ?? "compute";
        add(cid, cls, enq / consumers.length, Math.min(enq, capSum) / consumers.length);
      }
    }
    const next = /* @__PURE__ */ new Map();
    const out = /* @__PURE__ */ new Map();
    let delta = 0;
    for (const [nid, loads] of classLoad) {
      const profile = profileOf(nid);
      const replicas = replicasOf(nid) * capFactor(nid);
      const offered = offeredTotal.get(nid) ?? 0;
      let util = null;
      let capacity = null;
      if (profile && !profile.source) {
        let sum = 0;
        let known = true;
        let dominant;
        let best = -1;
        for (const [cls, v] of Object.entries(loads)) {
          const per = profile.capacity[cls];
          if (per === void 0) {
            if (v > 0) known = false;
            continue;
          }
          sum += replicas === 0 ? v > 0 ? Infinity : 0 : v / (per * replicas);
          if (v > best) {
            best = v;
            dominant = cls;
          }
        }
        util = known ? sum : null;
        const domCap = dominant ? profile.capacity[dominant] : void 0;
        capacity = domCap === void 0 ? null : domCap * replicas;
      }
      const r = util === null || util === 0 ? 1 : Math.min(1, 1 / util);
      next.set(nid, r);
      delta = Math.max(delta, Math.abs(r - (ratio.get(nid) ?? 1)));
      out.set(nid, {
        offered,
        admitted: admittedTotal.get(nid) ?? 0,
        capacity,
        utilization: util,
        admissionRatio: r,
        latencyP95Ms: null,
        source: profile?.source,
        queue: queueStats.get(nid)
      });
    }
    ratio = next;
    result = out;
    if (delta < 1e-6) break;
  }
  const nodeLat = (id) => {
    const p = profileOf(id);
    if (p?.source) return 0;
    const lat = p?.lat ?? DEFAULT_LAT;
    const u = result.get(id)?.utilization;
    const uc = u === null || u === void 0 ? 0 : Math.min(Number.isFinite(u) ? u : 1, 0.95);
    return lat.p95 + Math.min(lat.max, lat.base * uc / (1 - uc)) + (nodeEff(id).extraLatencyMs ?? 0);
  };
  for (const [id, l] of result) l.latencyP95Ms = l.source ? null : nodeLat(id);
  const edgeLat = (edgeId) => Number(edgeById.get(edgeId)?.configuration?.networkLatencyMs ?? 0) + (edgeEff(edgeId).extraLatencyMs ?? 0);
  const flowStats = /* @__PURE__ */ new Map();
  for (const { flow } of ordered) {
    const rootRps = opts.rps * (opts.weights?.[flow.id] ?? 1);
    const deadline = Number(doc.traffic.workloads?.find((w) => w.id === flow.workloadId)?.deadlineMs ?? 500);
    const kids = (id) => flow.steps.filter((x) => x.parentStepId === id);
    const dist = (st) => {
      if (st.parentStepId && !edgeById.has(st.edgeId)) return [];
      const ok = (ratio.get(st.nodeId) ?? 1) * (1 - Math.min(1, nodeEff(st.nodeId).errorRate ?? 0)) * (st.parentStepId ? 1 - (edgeEff(st.edgeId).dropRate ?? 0) : 1);
      let d2 = [{ lat: nodeLat(st.nodeId) + (st.parentStepId ? edgeLat(st.edgeId) : 0), w: ok }];
      for (const c of kids(st.id)) {
        if (c.condition !== "always") continue;
        const dependents = flow.steps.filter((x) => x.conditionStepId === c.id && x.parentStepId === st.id);
        if (c.required) {
          d2 = c.join === "parallel-all" ? parallel(d2, dist(c)) : serial(d2, dist(c));
          continue;
        }
        if (!dependents.length) continue;
        const cacheNode = nodes2.get(c.nodeId);
        const hit = cacheNode?.properties?.cache?.hitRate ?? 0;
        const down = isDown(c.nodeId);
        const bypass = cacheNode?.properties?.cache?.failureMode === "bypass";
        const lk = down ? 5 : nodeLat(c.nodeId) + edgeLat(c.edgeId);
        const missShare = down ? bypass ? 1 : 0 : 1 - hit;
        const hitShare = down ? 0 : hit;
        const missDist = dependents.filter((x) => x.required).reduce((acc, x) => serial(acc, dist(x)), [{ lat: 0, w: 1 }]);
        const group = tidy([{ lat: lk, w: hitShare }, ...serial([{ lat: lk, w: missShare }], missDist)]);
        d2 = serial(d2, group);
      }
      return d2;
    };
    const root = flow.steps.find((x) => !x.parentStepId);
    const d = root ? dist(root) : [];
    const within = d.filter((b) => b.lat <= deadline).reduce((a, b) => a + b.w, 0);
    const total = d.reduce((a, b) => a + b.w, 0);
    let p95 = null;
    if (total > 0) {
      let cum = 0;
      for (const b of d) {
        cum += b.w;
        if (cum >= 0.95 * total) {
          p95 = b.lat;
          break;
        }
      }
    }
    flowStats.set(flow.id, { offered: rootRps, completed: rootRps * within, timedOut: rootRps * (total - within), p95Ms: p95 });
  }
  return { loads: result, flows: flowStats };
}
const opt = (protocol, mode, label, hint, timeoutMs = 500, networkLatencyMs = 1, tls = true) => ({ protocol, mode, label, hint, timeoutMs, networkLatencyMs, tls });
const CLIENTS = ["client", "web-app", "mobile-app", "iot-device", "external-system"];
const DBS$1 = ["database", "sql-database", "nosql-database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"];
const QUEUES = ["kafka", "queue", "mqtt-broker", "event-bus"];
const SERVICES = [
  "backend",
  "microservice",
  "worker",
  "container",
  "kubernetes",
  "serverless",
  "vm",
  "edge-compute",
  "ml-service",
  "workflow-engine",
  "stream-processor",
  "batch-processor",
  "scheduler",
  "authentication-service",
  "notification-service",
  "iot-platform",
  "iot-gateway",
  "rate-limiter",
  "service-mesh"
];
const GRPC_OK = /* @__PURE__ */ new Set([...SERVICES, "api-gateway", "load-balancer", "vector-db", "observability", "service-discovery"]);
const EXTERNAL = ["payment-gateway", "third-party-api"];
const GRAPHQL_OK = /* @__PURE__ */ new Set(["backend", "microservice", "api-gateway", "container", "serverless", "kubernetes", "vm"]);
function storageOut(target) {
  const proto = target === "redis" ? "redis" : target === "sql-database" || target === "database" || target === "data-warehouse" ? "sql" : DBS$1.includes(target) ? "tcp" : "https";
  if (target === "redis" || DBS$1.includes(target)) {
    const kind = target === "redis" ? "Carga do cache (async)" : "Replicação / sincronização (async)";
    return [
      opt(proto, "async", kind, "Copia ou propaga dados entre os dois em segundo plano", 1e3, 2),
      opt(proto, "sync", "Escrita direta (sync)", "O armazenamento de origem grava no destino na mesma operação", 200, 1)
    ];
  }
  if (QUEUES.includes(target)) {
    const p = target === "mqtt-broker" ? "mqtt" : target === "event-bus" ? "https" : "kafka";
    return [opt(p, "async", "Captura de mudanças (CDC, async)", "Cada alteração vira um evento publicado", 1e3, 2)];
  }
  if (target === "search-engine" || target === "object-storage") {
    return [opt("https", "async", "Indexação / exportação (async)", "Envia os dados para busca, backup ou data lake em segundo plano", 2e3, 3)];
  }
  return [
    opt("https", "async", "Aviso de mudança (async)", "Notifica o consumidor quando os dados mudam", 1e3, 3),
    opt("tcp", "sync", "TCP (sync)", "Conexão direta", 300, 1)
  ];
}
function connectionOptions(sourceType, targetType) {
  if (CLIENTS.includes(targetType)) return [];
  if (DBS$1.includes(sourceType) || sourceType === "redis") return storageOut(targetType);
  if (CLIENTS.includes(sourceType)) {
    if (targetType === "websocket") return [opt("websocket", "sync", "WebSocket", "Conexão persistente e bidirecional")];
    if (targetType === "dns") return [opt("dns", "sync", "Resolução DNS", "Resolução no início da sessão, não por request", 100, 5, false)];
    if (targetType === "mqtt-broker") {
      return sourceType === "iot-device" ? [opt("mqtt", "async", "MQTT (publicar telemetria)", "Publicação leve em tópico, QoS 0/1; não espera a resposta do consumidor", 2e3, 20)] : [opt("mqtt", "async", "MQTT sobre WebSocket", "Assinatura de tópicos pelo navegador ou app", 2e3, 15)];
    }
    if (sourceType === "iot-device") {
      if (targetType === "iot-gateway") {
        return [
          opt("mqtt", "async", "MQTT (async)", "Telemetria publicada ao gateway local", 2e3, 5, false),
          opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP para dispositivos restritos", 800, 8, false),
          opt("ble", "async", "Bluetooth LE (async)", "Curto alcance e baixo consumo", 2e3, 30, false),
          opt("lorawan", "async", "LoRaWAN (async)", "Longo alcance, banda mínima e latência alta", 5e3, 400, false),
          opt("modbus", "sync", "Modbus (sync)", "Barramento industrial mestre/escravo", 300, 10, false),
          opt("opcua", "sync", "OPC UA (sync)", "Dados industriais com segurança e modelo de informação", 500, 8)
        ];
      }
      if (targetType === "iot-platform") {
        return [
          opt("mqtt", "async", "MQTT (async)", "Telemetria direto à plataforma IoT, com TLS", 2e3, 25),
          opt("https", "sync", "HTTPS (sync)", "Envio por HTTP; mais pesado que MQTT", 800, 30),
          opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP (DTLS)", 800, 25)
        ];
      }
      return [
        opt("https", "sync", "HTTPS (sync)", "Chamada HTTP com TLS; pesado para dispositivos pequenos", 800, 30),
        opt("http", "sync", "HTTP sem TLS (sync)", "Sem criptografia: só em rede local isolada", 800, 20, false),
        opt("coap", "sync", "CoAP (sync)", "Requisição leve sobre UDP", 800, 25, false),
        opt("tcp", "sync", "TCP (sync)", "Socket direto, protocolo próprio", 800, 25, false)
      ];
    }
    if (sourceType === "external-system") {
      return [opt("https", "sync", "HTTPS / webhook", "Parceiro ou sistema legado chamando a API"), opt("tcp", "sync", "TCP / SFTP", "Integração em lote ou protocolo legado", 2e3, 20)];
    }
    const out2 = [opt("https", "sync", "HTTPS", "Requisição síncrona com resposta, TLS na fronteira pública")];
    if (GRAPHQL_OK.has(targetType)) out2.push(opt("graphql", "sync", "GraphQL", "Consulta flexível sobre HTTPS; o cliente escolhe os campos"));
    if (targetType === "backend" || targetType === "api-gateway") out2.push(opt("sse", "sync", "Server-Sent Events", "Servidor empurra eventos por uma conexão HTTP aberta"));
    return out2;
  }
  if (targetType === "sql-database" || targetType === "database") {
    return [opt("sql", "sync", "SQL (sync)", "Consulta ou transação síncrona", 200)];
  }
  if (targetType === "data-warehouse") {
    return [opt("sql", "sync", "SQL analítico (sync)", "Consulta pesada sobre dados colunares; a latência é de segundos", 5e3, 3)];
  }
  if (targetType === "nosql-database") {
    return [opt("tcp", "sync", "TCP (sync)", "Protocolo nativo do banco, resposta síncrona", 200)];
  }
  if (targetType === "timeseries-db") {
    return [
      opt("https", "sync", "HTTP API (sync)", "Escrita de pontos e consultas por janela de tempo", 300),
      opt("tcp", "sync", "TCP (sync)", "Protocolo nativo ou line protocol", 300)
    ];
  }
  if (targetType === "graph-db") {
    return [opt("tcp", "sync", "Bolt / TCP (sync)", "Protocolo nativo para consultas de grafo", 300), opt("https", "sync", "HTTPS (sync)", "API HTTP do banco de grafos", 300)];
  }
  if (targetType === "vector-db") {
    return [opt("grpc", "sync", "gRPC (sync)", "Busca por similaridade e upsert de vetores", 300), opt("https", "sync", "HTTPS (sync)", "API REST do banco vetorial", 300)];
  }
  if (targetType === "redis") return [opt("redis", "sync", "Redis (sync)", "Lookup ou escrita em cache/KV, timeout curto", 50)];
  if (targetType === "mqtt-broker") return [opt("mqtt", "async", "MQTT (publicar)", "Publica em tópico; não inclui o consumo na latência", 2e3, 2)];
  if (targetType === "event-bus") return [opt("https", "async", "Publicar evento (async)", "Evento roteado por regras para vários consumidores", 1e3, 5)];
  if (QUEUES.includes(targetType)) {
    return [
      opt("kafka", "async", "Publicar no log (async)", "Enqueue durável; não inclui o consumo na latência"),
      opt("amqp", "async", "Publicar na fila (async)", "Mensageria com ack; não inclui o consumo na latência")
    ];
  }
  if (sourceType === "mqtt-broker") return [opt("mqtt", "async", "Assinatura MQTT (async)", "Consumidor assina o tópico", 2e3, 2, false)];
  if (sourceType === "event-bus") return [opt("https", "async", "Entrega do evento (async)", "Regra do barramento aciona o consumidor", 1e3, 5)];
  if (QUEUES.includes(sourceType)) {
    return [
      opt("kafka", "async", "Consumo (async)", "Consumer lê do log", 1e3, 1, false),
      opt("amqp", "async", "Consumo com ack (async)", "Consumer confirma após processar", 1e3, 1, false)
    ];
  }
  if (targetType === "object-storage") return [opt("https", "sync", "HTTPS (objeto)", "Upload/download de bytes; não conta como RPS de API")];
  if (targetType === "search-engine") return [opt("https", "sync", "HTTPS (busca)", "Consulta ou indexação")];
  if (targetType === "websocket") return [opt("websocket", "sync", "WebSocket", "Entrega a conexões abertas")];
  if (targetType === "observability") {
    return [
      opt("grpc", "async", "OTLP (async)", "Métricas, logs e traces enviados em segundo plano", 1e3, 2, false),
      opt("https", "async", "HTTPS (async)", "Envio de telemetria por HTTP", 1e3, 3)
    ];
  }
  if (targetType === "secrets-manager") return [opt("https", "sync", "HTTPS (sync)", "Busca de segredo, normalmente na inicialização e com cache", 200, 2)];
  if (targetType === "service-discovery") {
    return [opt("grpc", "sync", "gRPC (sync)", "Registro e consulta de instâncias", 100, 1, false), opt("dns", "sync", "DNS (sync)", "Descoberta por nome", 100, 1, false)];
  }
  if (EXTERNAL.includes(targetType)) return [opt("https", "sync", "HTTPS (API externa)", "Chamada a um provedor fora do seu controle; latência e falhas são dele", 3e3, 25)];
  if (EXTERNAL.includes(sourceType)) return [opt("https", "async", "Webhook de retorno (async)", "O provedor avisa a conclusão chamando você de volta", 2e3, 25)];
  if (sourceType === "cdn") return [opt("https", "sync", "HTTPS (origem)", "Busca na origem em caso de miss")];
  if (SERVICES.includes(sourceType) && SERVICES.includes(targetType)) {
    const out2 = [opt("https", "sync", "HTTPS (sync)", "Chamada síncrona entre serviços")];
    out2.push(opt("grpc", "sync", "gRPC (sync)", "RPC binário sobre HTTP/2, baixa latência entre serviços", 300, 0.8));
    if (GRAPHQL_OK.has(targetType)) out2.push(opt("graphql", "sync", "GraphQL (sync)", "Consulta flexível entre serviços ou federação"));
    out2.push(opt("internal", "sync", "Chamada interna (sync)", "Dentro do mesmo processo ou rede confiável", 300, 0.5, false));
    return out2;
  }
  const out = [
    opt("https", "sync", "HTTPS (sync)", "Chamada síncrona com resposta"),
    opt("tcp", "sync", "TCP (sync)", "Conexão direta")
  ];
  if (GRPC_OK.has(targetType)) out.splice(1, 0, opt("grpc", "sync", "gRPC (sync)", "RPC binário sobre HTTP/2", 300, 0.8));
  return out;
}
const emptyRequirements = () => ({
  functional: [],
  nonFunctional: [],
  scale: { users: "", rps: "", readWrite: "", storage: "" },
  targets: { latency: "", availability: "", consistency: "" },
  constraints: ""
});
const co = (id, title, logo, brand, focus, level, summary, concepts, req) => ({ id, title, icon: "business", group: "Empresas", level, summary, concepts, company: { logo: logo.startsWith("icon:") ? logo : `co-${logo}`, name: title, brand, focus }, req });
const COMPANY_CASES = [
  co(
    "netflix",
    "Netflix",
    "netflix",
    "#E50914",
    "Streaming global com CDN própria (Open Connect)",
    "Avançado",
    "Entrega vídeo sob demanda a centenas de milhões de assinantes, com a mídia servida de dentro dos provedores de internet e um plano de controle em microsserviços.",
    ["CDN própria", "Bitrate adaptativo", "Resiliência"],
    {
      functional: ["Catálogo e busca de títulos", "Reproduzir vídeo com qualidade adaptativa (DASH/HLS)", "Retomar de onde parou em qualquer dispositivo", "Recomendações personalizadas por perfil", "Pipeline de ingestão: codificar cada título em dezenas de formatos e resoluções"],
      nonFunctional: ["Separar plano de controle (login, catálogo, recomendação) do plano de dados (bytes de vídeo)", "Servir o vídeo pela borda: caches dentro dos ISPs, pré-posicionados fora do horário de pico", "Degradação graciosa: se a recomendação cair, mostrar uma lista genérica, nunca uma tela de erro", "Disjuntores e timeouts em toda chamada entre microsserviços", "Testar falhas de propósito (chaos engineering) em produção", "Início da reprodução em poucos segundos mesmo em rede ruim"],
      scale: { users: "centenas de milhões de assinantes", rps: "picos noturnos regionais", readWrite: "leitura altíssima", storage: "petabytes de vídeo em vários formatos" },
      targets: { latency: "início da reprodução em poucos segundos", availability: "99,99% no plano de controle", consistency: "Eventual no catálogo e nas recomendações" },
      constraints: "Decisões que a entrevista costuma cobrar: cache na borda vs. CDN pública, codificação por título, tolerância a falha regional, A/B testing contínuo e custo de banda."
    }
  ),
  co(
    "youtube",
    "YouTube",
    "youtube",
    "#FF0000",
    "Upload massivo, transcodificação e contagem de views em escala",
    "Avançado",
    "Recebe horas de vídeo por segundo, transcodifica, distribui e conta bilhões de visualizações sem perder consistência nos números.",
    ["Transcodificação", "Contagem de views", "Content ID"],
    {
      functional: ["Upload retomável de vídeos grandes", "Transcodificar em várias resoluções e codecs", "Reproduzir com bitrate adaptativo", "Comentários, curtidas e inscrições", "Detectar conteúdo protegido por direitos autorais no upload"],
      nonFunctional: ["Pipeline de transcodificação em etapas paralelas (DAG) sobre chunks do vídeo", "Contador de views aproximado e barato, com consolidação posterior", "Vídeos virais: tratar a cauda longa e o pico no mesmo desenho", "Armazenamento em camadas: quente para populares, frio para o resto", "Metadados fortemente consistentes; contadores eventualmente consistentes"],
      scale: { users: "mais de 2 bilhões de usuários logados/mês", rps: "milhões de reproduções simultâneas", readWrite: "leitura muito maior que escrita", storage: "exabytes" },
      targets: { latency: "início rápido da reprodução", availability: "99,95%", consistency: "Eventual nos contadores" }
    }
  ),
  co(
    "spotify",
    "Spotify",
    "spotify",
    "#1DB954",
    "Streaming de áudio, playlists colaborativas e recomendação",
    "Intermediário",
    "Reproduz áudio instantaneamente, permite editar playlists em conjunto e contabiliza cada execução para royalties e recomendação.",
    ["Playlists colaborativas", "Eventos de reprodução", "Recomendação"],
    {
      functional: ["Buscar e tocar faixas", "Criar e editar playlists, inclusive em conjunto", "Downloads para ouvir offline", "Mixes semanais personalizados", "Registrar cada execução para royalties"],
      nonFunctional: ["Início da faixa quase instantâneo (pré-carregar a próxima)", "Edição concorrente de playlist sem perder alterações (CRDT ou transformação operacional)", "Contagem de execuções sem perda e sem duplicidade (idempotência)", "Pipeline de eventos em streaming alimentando recomendações", "Licenças por região: catálogo diferente por país"],
      scale: { users: "centenas de milhões de usuários ativos", rps: "milhões de eventos/s no pico", readWrite: "leitura alta, eventos contínuos", storage: "mais de 100 milhões de faixas" },
      targets: { latency: "p95 < 300 ms para iniciar", availability: "99,95%", consistency: "Forte nos royalties; eventual nas recomendações" }
    }
  ),
  co(
    "tiktok",
    "TikTok",
    "tiktok",
    "#25F4EE",
    "Feed de vídeos curtos guiado por recomendação em tempo real",
    "Avançado",
    "O feed não depende de quem você segue: o ranking aprende com cada gesto em segundos e o próximo vídeo já está pré-carregado.",
    ["Recomendação", "Cold start", "Pré-carregamento"],
    {
      functional: ["Upload e processamento de vídeos curtos", "Feed infinito personalizado (For You)", "Curtir, comentar e compartilhar", "Efeitos e sons reutilizáveis", "Moderação de conteúdo"],
      nonFunctional: ["Sinais de engajamento (tempo assistido, repetição, pulo) entram no ranking em segundos", "Cold start: novos vídeos e novos usuários precisam de exploração controlada", "Pré-carregar os próximos vídeos no dispositivo sem desperdiçar banda", "Moderação automática antes da distribuição ampla", "Geradores de candidatos separados do ranqueador final"],
      scale: { users: "mais de 1 bilhão de usuários ativos", rps: "milhões de requisições de feed/s", readWrite: "leitura dominante", storage: "petabytes de vídeo curto" },
      targets: { latency: "próximo vídeo sem espera perceptível", availability: "99,9%", consistency: "Eventual" }
    }
  ),
  co(
    "instagram",
    "Instagram",
    "instagram",
    "#E4405F",
    "Feed, Stories e mídia com fan-out híbrido",
    "Intermediário",
    "Combina um feed ranqueado, Stories que expiram em 24 horas e armazenamento massivo de fotos e vídeos.",
    ["Fan-out híbrido", "Stories (TTL)", "IDs distribuídos"],
    {
      functional: ["Publicar fotos e vídeos", "Seguir contas e ver o feed", "Stories que expiram em 24 horas", "Curtir, comentar e mensagens diretas", "Explorar conteúdo de contas que não segue"],
      nonFunctional: ["Fan-out na escrita para contas comuns e na leitura para contas com milhões de seguidores", "IDs ordenáveis no tempo, gerados sem coordenação central", "Expiração de Stories sem varrer a base inteira (TTL)", "Mídia em várias resoluções servida por CDN", "Sharding dos dados do usuário sem perder consultas por relacionamento"],
      scale: { users: "bilhões de usuários", rps: "centenas de milhares de leituras de feed/s", readWrite: "leitura muito maior que escrita", storage: "petabytes de mídia" },
      targets: { latency: "feed em < 500 ms", availability: "99,95%", consistency: "Eventual no feed" }
    }
  ),
  co(
    "x",
    "X (Twitter)",
    "x",
    "#9AA4B2",
    "Timeline em tempo real e trending topics",
    "Avançado",
    "O clássico problema do fan-out: a mesma postagem pode precisar chegar a milhões de linhas do tempo em segundos.",
    ["Fan-out", "Top-K em streaming", "Busca em tempo real"],
    {
      functional: ["Postar mensagens curtas", "Seguir contas e ver a linha do tempo", "Busca com resultados em tempo real", "Assuntos em alta por região", "Repostar e responder em cadeia"],
      nonFunctional: ["Híbrido: pré-computar timelines comuns e mesclar contas gigantes na leitura", "Trending topics por contagem aproximada em janelas deslizantes (top-K em streaming)", "Índice de busca atualizado em segundos", "IDs únicos e ordenáveis (estilo Snowflake)", "Limites de taxa por usuário e por aplicativo"],
      scale: { users: "centenas de milhões de usuários ativos", rps: "centenas de milhares de leituras/s", readWrite: "leitura muito maior que escrita", storage: "centenas de bilhões de posts" },
      targets: { latency: "timeline em < 300 ms", availability: "99,95%", consistency: "Eventual" }
    }
  ),
  co(
    "linkedin",
    "LinkedIn",
    "linkedin",
    "#0A66C2",
    "Grafo social, graus de conexão e busca profissional",
    "Intermediário",
    "Responde perguntas sobre o grafo (conexões em comum, 2º e 3º graus) e sugere pessoas e vagas em tempo hábil.",
    ["Grafo social", "Busca", "Kafka"],
    {
      functional: ["Conectar-se com outros profissionais", "Ver o grau de conexão entre duas pessoas", "Feed profissional e mensagens", "Busca de pessoas, vagas e empresas", "Sugestões de pessoas que talvez você conheça"],
      nonFunctional: ["Consulta ao grafo (2º e 3º graus) em milissegundos, com grafo em memória e particionado", "Mudanças propagadas como log de eventos (Kafka) para busca, feed e recomendação", "Busca com permissões: o resultado depende de quem pergunta", "Dados do perfil consistentes; sugestões podem ser atrasadas", "Isolamento entre produtos para que um não derrube o outro"],
      scale: { users: "mais de 1 bilhão de membros", rps: "dezenas de milhares de consultas de grafo/s", readWrite: "leitura alta", storage: "bilhões de arestas" },
      targets: { latency: "p95 < 200 ms", availability: "99,95%", consistency: "Forte no perfil, eventual no restante" }
    }
  ),
  co(
    "whatsapp",
    "WhatsApp",
    "whatsapp",
    "#25D366",
    "Mensageria com criptografia de ponta a ponta e milhões de conexões por servidor",
    "Avançado",
    "Entrega mensagens com uma frota enxuta de servidores, sem que a empresa consiga ler o conteúdo, mesmo com o destinatário offline.",
    ["Criptografia E2E", "Armazena e encaminha", "Conexões persistentes"],
    {
      functional: ["Mensagens 1:1 e em grupo", "Confirmação de entrega e leitura", "Enviar fotos, vídeos e documentos", "Status de presença", "Mensagens para quem está offline"],
      nonFunctional: ["Criptografia de ponta a ponta: o servidor só vê mensagens cifradas", "Armazenar e encaminhar: guardar apenas até a entrega e depois apagar", "Cada servidor mantém centenas de milhares de conexões persistentes", "Ordem preservada por conversa, sem duplicar na reconexão", "Grupos: fan-out da mesma mensagem cifrada para cada membro", "Mídia enviada separada da mensagem, com link cifrado"],
      scale: { users: "mais de 2 bilhões de usuários", rps: "milhões de mensagens/s", readWrite: "equilibrado", storage: "mensagens guardadas só em trânsito" },
      targets: { latency: "entrega em < 1 s com ambos online", availability: "99,99%", consistency: "Ordem forte por conversa" }
    }
  ),
  co(
    "discord",
    "Discord",
    "discord",
    "#5865F2",
    "Chat e voz para comunidades enormes, com partições quentes",
    "Avançado",
    "Servidores com milhões de membros geram partições de dados muito desiguais e exigem presença e voz em tempo real.",
    ["Partições quentes", "Presença", "Voz (SFU)"],
    {
      functional: ["Canais de texto e voz por servidor", "Histórico de mensagens pesquisável", "Presença e digitação em tempo real", "Cargos e permissões", "Chamadas de voz e vídeo"],
      nonFunctional: ["Mensagens particionadas por canal e janela de tempo, para evitar partições quentes", "Presença de milhões de membros sem enviar a cada um todas as mudanças (fan-out controlado)", "Voz por SFU, escolhendo o servidor mais próximo", "Cada guild atendida por um único processo coordenador, que serializa os eventos", "Cache de leitura para canais muito lidos"],
      scale: { users: "centenas de milhões de usuários", rps: "milhões de eventos/s", readWrite: "equilibrado", storage: "trilhões de mensagens" },
      targets: { latency: "mensagem em < 200 ms", availability: "99,95%", consistency: "Ordem por canal" },
      constraints: "O laboratório simula mensagens, presença e dados. A voz por SFU faz parte da discussão, mas não é simulada."
    }
  ),
  co(
    "uber",
    "Uber",
    "uber",
    "#A0A8B8",
    "Pareamento geoespacial em tempo real e preço dinâmico",
    "Avançado",
    "Casa passageiros e motoristas próximos em segundos, com localização atualizada o tempo todo e estados de corrida que não podem se perder.",
    ["Índice geoespacial", "Matching", "Preço dinâmico"],
    {
      functional: ["Pedir corrida e ver motoristas próximos", "Parear passageiro e motorista", "Acompanhar o trajeto em tempo real", "Estimar tempo de chegada e preço", "Pagamento e avaliação ao final"],
      nonFunctional: ["Atualizações de posição de milhões de motoristas a cada poucos segundos", "Índice geoespacial em células (ex.: H3) para buscas por proximidade", "Pareamento sem oferecer o mesmo motorista a dois passageiros", "Corrida como máquina de estados durável e idempotente", "Preço dinâmico calculado por região e por janela de tempo", "Dados de localização fora do banco principal"],
      scale: { users: "dezenas de milhões de corridas/dia", rps: "milhões de pings de localização/s", readWrite: "escrita alta de posições", storage: "séries temporais de trajetos" },
      targets: { latency: "pareamento em poucos segundos", availability: "99,99%", consistency: "Forte no estado da corrida" }
    }
  ),
  co(
    "airbnb",
    "Airbnb",
    "airbnb",
    "#FF5A5F",
    "Busca por localização, disponibilidade e preço sem reserva duplicada",
    "Intermediário",
    "Combina busca geográfica com calendário e preço, e garante que dois hóspedes nunca reservem o mesmo período.",
    ["Busca geográfica", "Reserva sem conflito", "Pagamento em custódia"],
    {
      functional: ["Buscar por local, datas e filtros", "Ver calendário e preço por noite", "Reservar com pagamento", "Mensagens entre hóspede e anfitrião", "Avaliações mútuas"],
      nonFunctional: ["Índice de busca que combina geografia, disponibilidade e preço", "Reserva atômica: nunca duas confirmadas para o mesmo período", "Pagamento mantido em custódia e liberado após o check-in", "Avaliações em duplo cego, reveladas juntas", "Ranking que equilibra relevância, qualidade e novidade", "Preços e disponibilidade atualizados sem travar a busca"],
      scale: { users: "dezenas de milhões de hóspedes", rps: "milhares de buscas/s", readWrite: "leitura muito maior que escrita", storage: "milhões de anúncios e fotos" },
      targets: { latency: "busca em < 500 ms", availability: "99,95%", consistency: "Forte na reserva, eventual na busca" }
    }
  ),
  co(
    "amazon",
    "Amazon",
    "amazon",
    "#FF9900",
    "Carrinho sempre disponível, estoque e pedidos orquestrados",
    "Avançado",
    "Um carrinho que aceita escrita mesmo durante falhas, estoque que não vende o que não existe e um pedido que atravessa dezenas de serviços.",
    ["Alta disponibilidade", "Saga de pedidos", "Estoque"],
    {
      functional: ["Navegar e buscar produtos", "Carrinho e checkout", "Reservar estoque e confirmar pedido", "Pagamento e entrega", "Recomendações de produtos"],
      nonFunctional: ["Carrinho sempre gravável: priorizar disponibilidade e resolver conflitos depois", "Pedido orquestrado como saga com compensações", "Checkout idempotente: o mesmo clique nunca cobra duas vezes", "Reserva de estoque com expiração", "Resistir a picos de Black Friday com degradação seletiva", "Equipes e serviços independentes com contratos estáveis"],
      scale: { users: "centenas de milhões de clientes", rps: "dezenas de milhares de pedidos/s no pico", readWrite: "leitura alta, escrita crítica", storage: "centenas de milhões de itens" },
      targets: { latency: "página em < 300 ms", availability: "99,99%", consistency: "Eventual no carrinho, forte no pagamento" }
    }
  ),
  co(
    "stripe",
    "Stripe",
    "stripe",
    "#635BFF",
    "Pagamentos com idempotência, livro-razão e webhooks confiáveis",
    "Avançado",
    "Cada cobrança precisa acontecer exatamente uma vez, deixar rastro contábil completo e avisar o cliente de forma confiável.",
    ["Idempotência", "Livro-razão", "Webhooks"],
    {
      functional: ["Criar cobranças e assinaturas", "Estornos e disputas", "Webhooks para eventos de pagamento", "Painel e relatórios", "Versionamento da API"],
      nonFunctional: ["Chaves de idempotência em toda operação que muda dinheiro", "Livro-razão de dupla entrada, imutável e auditável", "Webhooks com retentativas, backoff e assinatura", "Isolamento de dados de cartão (PCI) do restante do sistema", "Limites de taxa em camadas por conta e por endpoint", "Mudanças de API compatíveis com clientes antigos"],
      scale: { users: "milhões de empresas", rps: "milhares de transações/s", readWrite: "escrita crítica", storage: "histórico financeiro permanente" },
      targets: { latency: "p99 < 1 s", availability: "99,999% na criação de cobranças", consistency: "Forte" }
    }
  ),
  co(
    "dropbox",
    "Dropbox",
    "dropbox",
    "#0061FF",
    "Sincronização por blocos, deduplicação e resolução de conflitos",
    "Intermediário",
    "Só trafega o que mudou, guarda cada bloco uma única vez e resolve o que acontece quando dois dispositivos editam o mesmo arquivo.",
    ["Blocos e deduplicação", "Sincronização", "Conflitos"],
    {
      functional: ["Enviar e baixar arquivos", "Sincronizar entre dispositivos", "Histórico de versões", "Compartilhar com permissões", "Retomar upload interrompido"],
      nonFunctional: ["Dividir arquivos em blocos e enviar só os que mudaram", "Deduplicar blocos por hash, inclusive entre usuários", "Metadados em banco consistente, blocos em armazenamento de objetos", "Notificar clientes de mudanças sem fazer polling pesado", "Conflitos: manter as duas versões em vez de perder uma", "Durabilidade altíssima dos dados"],
      scale: { users: "centenas de milhões de usuários", rps: "bilhões de operações de sincronização/dia", readWrite: "equilibrado", storage: "exabytes de blocos" },
      targets: { latency: "mudança visível nos outros dispositivos em segundos", availability: "99,95%", consistency: "Forte nos metadados" }
    }
  ),
  co(
    "ticketmaster",
    "Ticketmaster",
    "ticketmaster",
    "#026CDF",
    "Fila virtual e reserva de assentos sob pico extremo",
    "Avançado",
    "Milhões de pessoas disputam poucos assentos no mesmo minuto, com robôs tentando furar a fila.",
    ["Fila virtual", "Reserva temporária", "Anti-bot"],
    {
      functional: ["Ver mapa de assentos em tempo real", "Reservar assentos por tempo limitado", "Pagar e emitir ingresso", "Entrar na fila quando o evento estiver cheio", "Transferir ingressos"],
      nonFunctional: ["Fila virtual que admite só quem o sistema consegue atender", "Reserva temporária (hold) com expiração automática", "Nunca vender o mesmo assento duas vezes", "Detecção de robôs e limites por pessoa", "Pico de abertura de vendas: absorver na borda antes de chegar ao banco", "Pagamento com tempo limite e liberação do assento em caso de falha"],
      scale: { users: "milhões de pessoas simultâneas na abertura", rps: "picos de centenas de milhares de req/s", readWrite: "leitura alta, escrita disputada", storage: "inventário por evento" },
      targets: { latency: "resposta em < 1 s após entrar", availability: "99,9% durante vendas", consistency: "Forte no assento" }
    }
  ),
  co(
    "google-search",
    "Google Search",
    "google",
    "#4285F4",
    "Rastreio, índice invertido e consulta em milissegundos",
    "Avançado",
    "Percorre a web, constrói um índice distribuído e responde a cada consulta combinando milhares de máquinas em uma fração de segundo.",
    ["Índice invertido", "Sharding por documento", "Ranking em camadas"],
    {
      functional: ["Rastrear e atualizar páginas continuamente", "Montar um índice de busca por termo", "Responder consultas com resultados ranqueados", "Sugerir termos e corrigir erros de digitação", "Mostrar trechos relevantes (snippets)"],
      nonFunctional: ["Índice particionado: cada consulta é enviada a todos os shards e os resultados são mesclados", "Ranking em camadas: recuperação barata de candidatos e reordenação cara só nos melhores", "Consultas populares servidas por cache; cauda longa vai ao índice", "Índice atualizado em camadas (tempo real, diário, completo)", "Tolerar shards lentos sem atrasar a resposta (requisição com réplica e corte por tempo)"],
      scale: { users: "bilhões de consultas/dia", rps: "centenas de milhares de consultas/s", readWrite: "leitura quase total", storage: "trilhões de documentos indexados" },
      targets: { latency: "p95 < 200 ms", availability: "99,99%", consistency: "Eventual no índice" }
    }
  ),
  co(
    "google-maps",
    "Google Maps",
    "googlemaps",
    "#34A853",
    "Mapas em blocos, rotas e trânsito em tempo real",
    "Avançado",
    "Serve blocos de mapa pré-renderizados, calcula rotas sobre um grafo gigante e atualiza o trânsito a partir de milhões de dispositivos.",
    ["Blocos de mapa", "Grafo de rotas", "Trânsito em tempo real"],
    {
      functional: ["Exibir mapa em vários níveis de zoom", "Buscar lugares e endereços", "Calcular rotas e tempo de chegada", "Mostrar trânsito ao vivo", "Navegação passo a passo com recálculo"],
      nonFunctional: ["Mapa em blocos (tiles) pré-gerados e servidos por CDN", "Roteamento em grafo hierárquico: não percorrer a malha inteira a cada pedido", "Posições anônimas agregadas em streaming para estimar velocidade nas vias", "Recalcular rota rapidamente quando o trânsito muda", "Suporte offline com blocos e grafo regionais baixados"],
      scale: { users: "mais de 1 bilhão de usuários/mês", rps: "centenas de milhares de requisições de bloco/s", readWrite: "leitura muito maior que escrita", storage: "petabytes de mapas e imagens" },
      targets: { latency: "bloco em < 100 ms; rota em < 1 s", availability: "99,95%", consistency: "Eventual no trânsito" }
    }
  ),
  co(
    "slack",
    "Slack",
    "slack",
    "#9C5BA6",
    "Mensagens por workspace com busca e entrega em tempo real",
    "Intermediário",
    "Cada empresa é um espaço isolado, com canais, histórico pesquisável e milhares de conexões abertas por cliente.",
    ["Isolamento por workspace", "WebSocket", "Busca por permissão"],
    {
      functional: ["Canais públicos, privados e mensagens diretas", "Histórico pesquisável", "Threads, reações e arquivos", "Notificações no desktop e no celular", "Integrações e bots via API"],
      nonFunctional: ["Particionar dados por workspace para isolar clientes grandes e escalar", "Entrega em tempo real por conexão persistente com reconexão e catch-up", "Busca respeitando as permissões de cada canal", "Notificações sem duplicar entre dispositivos", "Limites de taxa por integração para proteger a plataforma"],
      scale: { users: "dezenas de milhões de usuários diários", rps: "dezenas de milhares de mensagens/s", readWrite: "leitura maior que escrita", storage: "bilhões de mensagens" },
      targets: { latency: "mensagem entregue em < 500 ms", availability: "99,99%", consistency: "Ordem por canal" }
    }
  ),
  co(
    "zoom",
    "Zoom",
    "zoom",
    "#0B5CFF",
    "Videoconferência com mídia roteada por SFU e adaptação à rede",
    "Avançado",
    "Mantém dezenas de participantes em tempo real distribuindo vídeo por servidores de mídia e degradando a qualidade antes de travar.",
    ["SFU", "Adaptação de banda", "Roteamento regional"],
    {
      functional: ["Criar e entrar em reuniões", "Áudio e vídeo de vários participantes", "Compartilhar tela e gravar", "Salas de apoio e chat", "Reuniões agendadas e convites"],
      nonFunctional: ["Mídia por SFU: cada participante envia um fluxo e o servidor replica para os demais", "Simulcast: vários níveis de qualidade e escolha por receptor", "Escolher o servidor de mídia mais próximo e migrar quando necessário", "Sinalização separada da mídia", "Gravação em segundo plano sem afetar a reunião"],
      scale: { users: "centenas de milhões de participantes/dia", rps: "milhões de fluxos de mídia simultâneos", readWrite: "mídia contínua; plano de controle com mais leitura", storage: "gravações sob demanda" },
      targets: { latency: "latência fim a fim < 300 ms", availability: "99,99%", consistency: "Eventual nos metadados" },
      constraints: "O laboratório simula o plano de controle (reuniões, sinalização e metadados). A mídia por SFU e o simulcast fazem parte da discussão, mas não são simulados."
    }
  ),
  co(
    "pinterest",
    "Pinterest",
    "pinterest",
    "#E60023",
    "Grafo de interesses, descoberta visual e imagens em escala",
    "Intermediário",
    "Organiza bilhões de pins em quadros e recomenda por similaridade visual e comportamento, com imagens servidas em vários tamanhos.",
    ["Recomendação visual", "Sharding por usuário", "Imagens em CDN"],
    {
      functional: ["Salvar pins em quadros", "Seguir pessoas e interesses", "Feed de descoberta personalizado", "Busca visual por imagem", "Compartilhar e comentar"],
      nonFunctional: ["Dados particionados por usuário, com mapeamento fixo de ID para shard", "Imagens em vários tamanhos geradas no envio e servidas por CDN", "Candidatos por grafo e embeddings, depois ranqueados por modelo", "Feed pré-computado e cacheado, atualizado de forma assíncrona", "Deduplicar pins iguais"],
      scale: { users: "centenas de milhões de usuários/mês", rps: "dezenas de milhares de consultas de feed/s", readWrite: "leitura muito maior que escrita", storage: "dezenas de bilhões de pins" },
      targets: { latency: "feed em < 500 ms", availability: "99,95%", consistency: "Eventual" }
    }
  ),
  co(
    "reddit",
    "Reddit",
    "reddit",
    "#FF4500",
    "Votos, comentários em árvore e ranking que muda o tempo todo",
    "Intermediário",
    "Milhões de votos por dia reordenam listas e threads de comentários profundas, com picos de atenção imprevisíveis.",
    ["Contagem de votos", "Comentários em árvore", "Ranking quente"],
    {
      functional: ["Postar em comunidades", "Votar em posts e comentários", "Comentários aninhados", "Ordenar por quente, novo e melhores", "Moderação por comunidade"],
      nonFunctional: ["Votos agregados de forma assíncrona: contador aproximado agora, exato depois", "Comentários em árvore carregados por partes (profundidade limitada)", "Ranking recalculado em lote e em streaming", "Posts virais: cache agressivo e proteção do banco", "Moderação com regras por comunidade e filas de revisão"],
      scale: { users: "centenas de milhões de usuários/mês", rps: "dezenas de milhares de leituras/s", readWrite: "leitura muito maior que escrita", storage: "bilhões de comentários" },
      targets: { latency: "p95 < 300 ms", availability: "99,9%", consistency: "Eventual nos votos" }
    }
  ),
  co(
    "twitch",
    "Twitch",
    "twitch",
    "#9146FF",
    "Transmissão ao vivo com baixa latência e chat em massa",
    "Avançado",
    "Recebe vídeo ao vivo de milhões de streamers, transcodifica na hora e entrega a espectadores enquanto um chat gigantesco corre ao lado.",
    ["Ingestão ao vivo", "Transcodificação em tempo real", "Chat em massa"],
    {
      functional: ["Transmitir ao vivo (ingestão RTMP)", "Assistir com qualidade adaptativa", "Chat da transmissão", "Clipes e reprises", "Seguir e receber avisos de início"],
      nonFunctional: ["Ingestão perto do streamer e transcodificação imediata em várias qualidades", "Entrega por CDN com poucos segundos de atraso", "Chat com limite por canal, lentidão e moderação automática", "Canais gigantes: fan-out do chat sem derrubar o servidor", "Gravar a transmissão para reprises sem atrasar o ao vivo"],
      scale: { users: "dezenas de milhões de espectadores/dia", rps: "milhões de mensagens de chat/min", readWrite: "leitura (vídeo) muito alta", storage: "petabytes de reprises" },
      targets: { latency: "atraso ao vivo de poucos segundos", availability: "99,95%", consistency: "Eventual no chat" }
    }
  ),
  co(
    "wikipedia",
    "Wikipedia",
    "wikipedia",
    "#9AA4B2",
    "Leitura global quase toda em cache, escrita com histórico",
    "Iniciante",
    "Um site de leitura intensa servido quase inteiro por cache e CDN, com edições versionadas e reversíveis.",
    ["Cache em camadas", "Versionamento", "Leitura global"],
    {
      functional: ["Ler artigos em vários idiomas", "Editar com histórico de revisões", "Buscar artigos", "Reverter vandalismo", "Páginas de discussão"],
      nonFunctional: ["Mais de 95% das leituras servidas por cache e CDN", "Invalidar o cache da página editada sem derrubar o resto", "Todas as revisões guardadas e comparáveis", "Busca por texto completo", "Operar com custo baixo e picos por notícias"],
      scale: { users: "mais de 1 bilhão de dispositivos únicos/mês", rps: "dezenas de milhares de requisições/s", readWrite: "99% leitura", storage: "dezenas de TB de texto e histórico" },
      targets: { latency: "p95 < 200 ms", availability: "99,95%", consistency: "Forte na edição, eventual na leitura" }
    }
  ),
  co(
    "ifood",
    "iFood",
    "ifood",
    "#EA1D2C",
    "Pedido, restaurante e entregador em tempo real no horário de pico",
    "Intermediário",
    "No horário do almoço, milhões de pedidos precisam ser aceitos, repassados ao restaurante e despachados a entregadores próximos.",
    ["Máquina de estados do pedido", "Despacho geográfico", "Picos de refeição"],
    {
      functional: ["Cardápios e busca por restaurantes próximos", "Fazer e pagar o pedido", "Repassar ao restaurante e acompanhar o preparo", "Despachar entregador e rastrear a entrega", "Avaliações e cupons"],
      nonFunctional: ["Pedido como máquina de estados durável (criado, aceito, em preparo, a caminho, entregue)", "Busca por restaurantes por localização e disponibilidade", "Despacho considera distância, fila do restaurante e carga do entregador", "Pico no almoço e jantar: pré-escalar e degradar recursos secundários", "Idempotência no pagamento e na confirmação do pedido"],
      scale: { users: "mais de 100 milhões de pedidos/mês", rps: "milhares de pedidos/min no pico", readWrite: "leitura maior que escrita", storage: "milhões de itens de cardápio" },
      targets: { latency: "p95 < 400 ms", availability: "99,95%", consistency: "Forte no pedido" }
    }
  ),
  co(
    "nubank",
    "Nubank",
    "nubank",
    "#A855F7",
    "Contas e cartões com consistência forte e auditoria completa",
    "Avançado",
    "Cada centavo precisa estar certo: transações viram eventos imutáveis e todo saldo é derivado de um livro-razão auditável.",
    ["Event sourcing", "Livro-razão", "Consistência forte"],
    {
      functional: ["Contas, cartões e extrato", "Autorizar compras no cartão", "Transferências entre contas", "Fatura e limite em tempo real", "Notificação a cada transação"],
      nonFunctional: ["Estado derivado de eventos imutáveis (event sourcing)", "Autorização do cartão em poucos milissegundos, mesmo sob falha parcial", "Saldo nunca negativo por concorrência: serializar por conta", "Auditoria e rastreabilidade de toda alteração", "Reprocessar eventos para corrigir erros sem perder histórico", "Isolamento de dados sensíveis"],
      scale: { users: "mais de 100 milhões de clientes", rps: "milhares de transações/s", readWrite: "equilibrado, escrita crítica", storage: "histórico financeiro permanente" },
      targets: { latency: "autorização em < 200 ms", availability: "99,99%", consistency: "Forte por conta" }
    }
  ),
  co(
    "pix",
    "Pix",
    "pix",
    "#32BCAD",
    "Pagamento instantâneo 24×7 com liquidação em segundos",
    "Avançado",
    "Transferências entre instituições em menos de 10 segundos, a qualquer hora, sem duplicar nem perder uma operação.",
    ["Liquidação instantânea", "Idempotência", "Diretório de chaves"],
    {
      functional: ["Cadastrar e consultar chaves (CPF, e-mail, telefone, aleatória)", "Iniciar pagamento por chave ou QR Code", "Liquidar entre instituições em segundos", "Devolução e contestação", "Comprovante e extrato"],
      nonFunctional: ["Operar 24 horas por dia, todos os dias, sem janela de manutenção", "Liquidação em poucos segundos com confirmação para ambos os lados", "Idempotência: a mesma ordem nunca debita duas vezes", "Diretório de chaves consultado em milissegundos", "Reconciliação entre instituições e trilha de auditoria", "Limites e antifraude no caminho da transação"],
      scale: { users: "mais de 150 milhões de pessoas", rps: "milhares de transações/s no pico", readWrite: "escrita crítica", storage: "histórico financeiro permanente" },
      targets: { latency: "p95 < 1 s por etapa; fim a fim < 10 s", availability: "99,99%", consistency: "Forte" }
    }
  ),
  co(
    "mercado-livre",
    "Mercado Livre",
    "mercado-livre",
    "#FFC400",
    "Marketplace com busca, anúncios e pedidos de milhões de vendedores",
    "Avançado",
    "Um marketplace em que preço e estoque mudam o tempo todo, a busca precisa ser rápida e cada pedido envolve vendedor, pagamento e envio.",
    ["Busca e filtros", "Estoque por vendedor", "Pedido com pagamento e envio"],
    {
      functional: ["Publicar e editar anúncios", "Buscar com filtros e ordenação", "Carrinho, compra e pagamento", "Perguntas e avaliações", "Rastrear o envio"],
      nonFunctional: ["Índice de busca atualizado quando preço ou estoque mudam", "Estoque por anúncio sem vender além do disponível", "Pedido orquestrado entre pagamento, vendedor e logística (saga)", "Picos em campanhas: cache de páginas de produto e filas para tarefas assíncronas", "Isolar falhas de um vendedor ou serviço do restante"],
      scale: { users: "dezenas de milhões de compradores/mês", rps: "dezenas de milhares de consultas/s", readWrite: "leitura muito maior que escrita", storage: "centenas de milhões de anúncios" },
      targets: { latency: "busca em < 400 ms", availability: "99,95%", consistency: "Forte no estoque, eventual na busca" }
    }
  ),
  co(
    "free-fire",
    "Free Fire",
    "freefire",
    "#F9A21B",
    "Partidas em tempo real e pico de lançamento de atualização",
    "Avançado",
    "Um battle royale mobile com milhões de jogadores ao mesmo tempo: montar partidas rápido, manter cada partida em tempo real e sobreviver ao dia em que todo mundo baixa a atualização.",
    ["Matchmaking", "Servidor de partida", "Distribuição de patch"],
    {
      functional: ["Login e perfil do jogador", "Matchmaking por região e nível de habilidade", "Partida em tempo real com dezenas de jogadores", "Loja, inventário e compras dentro do jogo", "Ranking e temporadas", "Baixar a atualização do jogo"],
      nonFunctional: ["Dia de lançamento: milhões baixando o patch ao mesmo tempo, servido pela CDN e não pelo backend", "Estado da partida em memória e em tempo real, com servidor autoritativo contra trapaça", "Matchmaking que não trava em pico: fila de espera e limites de entrada por região", "Compras com consistência forte: nunca cobrar duas vezes nem perder um item", "Telemetria e eventos de jogo em log para antitrapaça e balanceamento", "Degradação graciosa: se a loja cair, as partidas continuam"],
      scale: { users: "dezenas de milhões de jogadores ativos por dia", rps: "picos de centenas de milhares de req/s no lançamento", readWrite: "leitura alta, escrita constante de eventos", storage: "perfis, inventários e patches de vários GB" },
      targets: { latency: "resposta de partida em < 100 ms", availability: "99,95% durante eventos", consistency: "Forte nas compras, eventual no ranking" },
      constraints: "Decisões que a entrevista costuma cobrar: separar plano de partida do plano de conta, regionalizar servidores de jogo, pré-distribuir o patch pela CDN, proteger o login em pico e tratar trapaça."
    }
  ),
  co(
    "shopee",
    "Shopee",
    "shopee",
    "#EE4D2D",
    "Marketplace mobile com flash sales e campanhas de pico (11.11)",
    "Avançado",
    "Um marketplace usado quase só pelo celular, onde campanhas como 11.11 concentram milhões de compras em minutos e o estoque de cada oferta relâmpago é limitado.",
    ["Flash sale", "Estoque atômico", "Checkout em pico"],
    {
      functional: ["Buscar produtos com filtros", "Ver ofertas relâmpago com contagem regressiva", "Carrinho e checkout com pagamento", "Cupons e moedas de desconto", "Acompanhar pedido e entrega", "Chat entre comprador e vendedor"],
      nonFunctional: ["Estoque da oferta relâmpago decrementado de forma atômica: nunca vender além do disponível", "Pico de campanha: páginas e imagens em cache e CDN, checkout protegido por fila", "Pedido orquestrado entre pagamento, estoque e logística (saga), com compensação em caso de falha", "Índice de busca atualizado quando preço ou estoque mudam", "Limites por usuário e proteção contra robôs de compra", "Isolar falha de um vendedor ou serviço do restante"],
      scale: { users: "dezenas de milhões de compradores por dia em campanha", rps: "dezenas de milhares de req/s no pico do 11.11", readWrite: "leitura muito maior que escrita, com rajadas de escrita", storage: "centenas de milhões de produtos e imagens" },
      targets: { latency: "busca e página de produto em < 400 ms", availability: "99,95% em campanha", consistency: "Forte no estoque, eventual na busca" },
      constraints: "Decisões que a entrevista costuma cobrar: reserva atômica de estoque (Redis ou banco), fila para o checkout, pré-aquecer cache antes da campanha, idempotência de pedido e degradar recomendações antes do pagamento."
    }
  ),
  co(
    "itau",
    "Itaú",
    "itau",
    "#EC7000",
    "Banco digital em escala: transações consistentes, antifraude e legado integrado",
    "Avançado",
    "Um banco com milhões de clientes no app, Pix e cartões: cada operação precisa ser consistente e auditável, com antifraude em tempo real e integração com sistemas legados.",
    ["Ledger", "Antifraude em tempo real", "Integração com legado"],
    {
      functional: ["Saldo e extrato", "Transferências, Pix e pagamento de contas", "Cartões: compra, fatura e limite", "Alertas de segurança e notificações", "Autenticação forte no app", "Investimentos e consulta de posição"],
      nonFunctional: ["Consistência forte em saldo e transferências: nunca perder ou duplicar dinheiro", "Eventos imutáveis de transação como trilha de auditoria exigida por regulação", "Antifraude em tempo real analisando cada operação sem atrasar o cliente", "Picos em dia de pagamento e de 13º salário: leitura de saldo em cache", "Core bancário legado protegido por uma camada de integração, sem sobrecarregá-lo", "Alta disponibilidade e recuperação de desastre entre regiões"],
      scale: { users: "dezenas de milhões de clientes", rps: "dezenas de milhares de consultas por segundo", readWrite: "leitura maior que escrita, com escrita crítica", storage: "histórico de transações por décadas" },
      targets: { latency: "operação em < 300 ms", availability: "99,99% nas operações essenciais", consistency: "Forte nas transações" },
      constraints: "Decisões que a entrevista costuma cobrar: ledger como fonte da verdade, idempotência em Pix e transferências, camada anticorrupção sobre o legado, antifraude assíncrono com bloqueio síncrono só quando necessário e conformidade."
    }
  )
];
const caseRequirements = (c) => ({ ...emptyRequirements(), ...c.req });
const LOADS = {
  "url-shortener": { peakRps: 5e3, readPct: 99 },
  "rate-limiter": { peakRps: 2e4, readPct: 50 },
  "key-value-store": { peakRps: 5e4, readPct: 70 },
  "notification-system": { peakRps: 1e4, readPct: 20 },
  chat: { peakRps: 3e4, readPct: 50 },
  "video-call": { peakRps: 5e3, readPct: 50 },
  "social-feed": { peakRps: 2e4, readPct: 95 },
  "video-streaming": { peakRps: 3e4, readPct: 99 },
  "photo-sharing": { peakRps: 8e3, readPct: 95 },
  "search-autocomplete": { peakRps: 4e4, readPct: 99 },
  ecommerce: { peakRps: 1e4, readPct: 90 },
  payments: { peakRps: 3e3, readPct: 30 },
  ticketing: { peakRps: 5e4, readPct: 70 },
  "ride-hailing": { peakRps: 25e3, readPct: 30 },
  "food-delivery": { peakRps: 8e3, readPct: 60 },
  "file-storage": { peakRps: 5e3, readPct: 60 },
  "web-crawler": { peakRps: 5e3, readPct: 20 },
  netflix: { peakRps: 1e5, readPct: 98 },
  youtube: { peakRps: 8e4, readPct: 97 },
  spotify: { peakRps: 5e4, readPct: 90 },
  tiktok: { peakRps: 1e5, readPct: 95 },
  instagram: { peakRps: 6e4, readPct: 95 },
  x: { peakRps: 6e4, readPct: 92 },
  linkedin: { peakRps: 3e4, readPct: 92 },
  whatsapp: { peakRps: 6e4, readPct: 50 },
  discord: { peakRps: 7e4, readPct: 60 },
  uber: { peakRps: 4e4, readPct: 30 },
  airbnb: { peakRps: 15e3, readPct: 97 },
  amazon: { peakRps: 5e4, readPct: 90 },
  stripe: { peakRps: 2e4, readPct: 40 },
  "google-search": { peakRps: 1e5, readPct: 99 },
  "google-maps": { peakRps: 6e4, readPct: 97 },
  slack: { peakRps: 3e4, readPct: 80 },
  zoom: { peakRps: 8e3, readPct: 70 },
  pinterest: { peakRps: 3e4, readPct: 95 },
  reddit: { peakRps: 3e4, readPct: 90 },
  twitch: { peakRps: 5e4, readPct: 80 },
  wikipedia: { peakRps: 4e4, readPct: 99 },
  ifood: { peakRps: 15e3, readPct: 85 },
  nubank: { peakRps: 15e3, readPct: 60 },
  pix: { peakRps: 1e4, readPct: 40 },
  "mercado-livre": { peakRps: 3e4, readPct: 92 },
  dropbox: { peakRps: 2e4, readPct: 60 },
  ticketmaster: { peakRps: 6e4, readPct: 80 },
  "free-fire": { peakRps: 9e4, readPct: 70 },
  shopee: { peakRps: 7e4, readPct: 88 },
  itau: { peakRps: 25e3, readPct: 65 }
};
const loadOf = (id) => LOADS[id];
const N = (label, any, why) => ({ label, any, why });
const CDN = N("CDN na borda", ["cdn"], "Mídia e estáticos servidos perto do usuário, longe do backend.");
const CACHE = N("Cache de leitura", ["redis"], "Absorve a leitura repetida e protege o banco.");
const STREAM = N("Log de eventos ou fila", ["kafka", "queue"], "Desacopla produtores de consumidores e absorve picos.");
const WS = N("Conexões persistentes", ["websocket"], "Entrega em tempo real sem polling.");
const DB = N("Banco de dados", ["sql-database", "nosql-database"], "Armazenamento durável da fonte da verdade.");
const SQL$1 = N("Banco SQL", ["sql-database"], "Transações e consistência forte onde o dinheiro ou o estoque estão em jogo.");
const NOSQL$1 = N("Banco NoSQL", ["nosql-database"], "Escala horizontal para volume e escrita altos.");
const OBJ = N("Object storage", ["object-storage"], "Blobs grandes (vídeo, foto, arquivo) fora do banco.");
const SEARCH = N("Índice de busca", ["search-engine"], "Busca por texto e filtros sem varrer o banco.");
const WORKER = N("Workers", ["worker"], "Processamento assíncrono fora do caminho da requisição.");
const GW = N("Gateway ou balanceador", ["api-gateway", "load-balancer"], "Ponto de entrada com roteamento, limites e distribuição de carga.");
const CHECKS = {
  "url-shortener": { p95Ms: 100, needs: [CACHE, DB] },
  "rate-limiter": { p95Ms: 60, needs: [N("Contador rápido", ["redis"], "Contagem por cliente em memória, com expiração."), GW] },
  "key-value-store": { p95Ms: 60, needs: [NOSQL$1, CACHE] },
  "notification-system": { needs: [STREAM, WORKER, N("Serviço de notificações", ["notification-service"], "Envio por push, e-mail e SMS.")] },
  chat: { p95Ms: 200, needs: [WS, STREAM, DB] },
  "video-call": { p95Ms: 150, needs: [WS, GW] },
  "social-feed": { p95Ms: 300, needs: [CACHE, STREAM, DB] },
  "video-streaming": { needs: [CDN, OBJ, STREAM, WORKER] },
  "photo-sharing": { p95Ms: 300, needs: [CDN, OBJ] },
  "search-autocomplete": { p95Ms: 100, needs: [SEARCH, CACHE] },
  ecommerce: { p95Ms: 300, needs: [SQL$1, STREAM, CACHE, SEARCH] },
  payments: { p95Ms: 1e3, needs: [SQL$1, STREAM] },
  ticketing: { p95Ms: 1e3, needs: [CACHE, SQL$1, STREAM] },
  "ride-hailing": { p95Ms: 500, needs: [CACHE, N("Log de eventos", ["kafka"], "Fluxo contínuo de posições e estados da corrida."), WS] },
  "food-delivery": { p95Ms: 500, needs: [STREAM, WS, DB] },
  "file-storage": { p95Ms: 500, needs: [OBJ, SQL$1, N("Aviso de mudanças", ["queue", "kafka", "websocket"], "Notifica os dispositivos sem polling.")] },
  "web-crawler": { needs: [N("Fila de URLs", ["queue", "kafka"], "Fronteira de URLs a visitar."), WORKER, OBJ] },
  netflix: { p95Ms: 200, needs: [CDN, CACHE, N("Log de eventos", ["kafka"], "Eventos de reprodução e telemetria para recomendação."), N("API Gateway", ["api-gateway"], "Entrada única do plano de controle."), NOSQL$1, OBJ] },
  youtube: { p95Ms: 300, needs: [CDN, OBJ, STREAM, WORKER, CACHE] },
  spotify: { p95Ms: 300, needs: [CDN, OBJ, N("Log de eventos", ["kafka"], "Eventos de execução para royalties e recomendação."), CACHE, NOSQL$1] },
  tiktok: { p95Ms: 300, needs: [CDN, N("Log de eventos", ["kafka"], "Sinais de engajamento em tempo quase real."), CACHE, OBJ] },
  instagram: { p95Ms: 500, needs: [CDN, CACHE, OBJ, DB, STREAM] },
  x: { p95Ms: 300, needs: [CACHE, N("Log de eventos", ["kafka"], "Fan-out e trending em streaming."), SEARCH, NOSQL$1] },
  linkedin: { p95Ms: 200, needs: [N("Log de eventos", ["kafka"], "Propaga mudanças do grafo para busca, feed e recomendação."), SEARCH, CACHE, DB] },
  whatsapp: { p95Ms: 200, needs: [WS, STREAM, NOSQL$1, OBJ] },
  discord: { p95Ms: 200, needs: [WS, NOSQL$1, CACHE, N("Log de eventos", ["kafka"], "Eventos entre guilds e serviços.")] },
  uber: { p95Ms: 500, needs: [N("Log de eventos", ["kafka"], "Fluxo de posições e estados de corrida."), CACHE, WS, SQL$1, N("Banco NoSQL", ["nosql-database"], "Posições e trajetos como séries temporais, fora do banco da corrida.")] },
  airbnb: { p95Ms: 500, needs: [SEARCH, SQL$1, CACHE, STREAM] },
  amazon: { p95Ms: 300, needs: [SQL$1, NOSQL$1, STREAM, CACHE, CDN, OBJ] },
  stripe: { p95Ms: 1e3, needs: [SQL$1, STREAM, N("API Gateway", ["api-gateway"], "Autenticação, limites de taxa e versionamento na entrada.")] },
  "google-search": { p95Ms: 200, needs: [SEARCH, CACHE, WORKER, OBJ, NOSQL$1] },
  "google-maps": { p95Ms: 300, needs: [CDN, OBJ, N("Log de eventos", ["kafka"], "Posições anônimas agregadas em streaming para o trânsito."), CACHE, NOSQL$1] },
  slack: { p95Ms: 500, needs: [WS, SEARCH, DB, STREAM] },
  zoom: { p95Ms: 300, needs: [WS, GW, DB] },
  pinterest: { p95Ms: 500, needs: [CDN, CACHE, OBJ, DB, STREAM] },
  reddit: { p95Ms: 300, needs: [CACHE, STREAM, SQL$1, SEARCH] },
  twitch: { p95Ms: 500, needs: [CDN, WS, OBJ, STREAM, WORKER] },
  wikipedia: { p95Ms: 200, needs: [CDN, OBJ, CACHE, SQL$1, SEARCH] },
  ifood: { p95Ms: 400, needs: [SEARCH, SQL$1, STREAM, CACHE, WS] },
  nubank: { p95Ms: 200, needs: [SQL$1, N("Log de eventos", ["kafka"], "Eventos imutáveis são a fonte da verdade (event sourcing)."), CACHE, GW] },
  pix: { p95Ms: 1e3, needs: [SQL$1, STREAM, CACHE, GW] },
  "mercado-livre": { p95Ms: 400, needs: [SEARCH, SQL$1, CACHE, STREAM, CDN, OBJ] },
  dropbox: { p95Ms: 500, needs: [OBJ, SQL$1, STREAM] },
  ticketmaster: { p95Ms: 1e3, needs: [CACHE, SQL$1, STREAM, N("Balanceador", ["load-balancer"], "Distribui a abertura de vendas.")] },
  "free-fire": { p95Ms: 100, needs: [CDN, OBJ, WS, CACHE, NOSQL$1, SQL$1, N("Log de eventos", ["kafka"], "Telemetria de partida e sinais de antitrapaça em streaming."), GW] },
  shopee: { p95Ms: 400, needs: [SEARCH, CACHE, SQL$1, CDN, OBJ, N("Log de eventos", ["kafka"], "Pedidos, estoque e pagamentos orquestrados por eventos."), GW] },
  itau: { p95Ms: 300, needs: [SQL$1, N("Log de eventos", ["kafka"], "Eventos imutáveis de transação para auditoria e antifraude."), CACHE, GW, N("Serviço de notificações", ["notification-service"], "Alertas de segurança e de transação ao cliente.")] }
};
const CHAOS_HINTS = {
  "url-shortener": ["redis", "t10", "dblat"],
  "rate-limiter": ["redis", "spike"],
  "key-value-store": ["partition", "disk", "az"],
  "notification-system": ["svc", "spike"],
  chat: ["flap", "partition"],
  "video-call": ["highlat", "loss"],
  "social-feed": ["redis", "spike"],
  "video-streaming": ["bw", "t10"],
  "photo-sharing": ["disk", "t10"],
  "search-autocomplete": ["redis", "t10"],
  ecommerce: ["t100", "dbdown"],
  payments: ["dbdown", "partition"],
  ticketing: ["t100", "spike"],
  "ride-hailing": ["highlat", "spike"],
  "food-delivery": ["svc", "spike"],
  "file-storage": ["disk", "corrupt"],
  "web-crawler": ["loss", "svc"],
  netflix: ["redis", "xregion", "t10", "dblat"],
  youtube: ["dblat", "t10", "disk"],
  spotify: ["redis", "dbdown"],
  tiktok: ["redis", "spike"],
  instagram: ["redis", "dbdown", "az"],
  x: ["spike", "redis", "dbdown"],
  linkedin: ["dbdown", "partition"],
  whatsapp: ["partition", "az", "loss"],
  discord: ["flap", "spike", "partition"],
  uber: ["xregion", "dblat", "spike"],
  airbnb: ["dbdown", "dblat"],
  "google-search": ["t10", "redis", "dblat"],
  "google-maps": ["t10", "xregion", "redis"],
  slack: ["flap", "partition", "dbdown"],
  zoom: ["highlat", "loss", "az"],
  pinterest: ["redis", "dbdown"],
  reddit: ["spike", "redis", "dbdown"],
  twitch: ["spike", "bw", "az"],
  wikipedia: ["t10", "redis"],
  ifood: ["spike", "svc", "dbdown"],
  nubank: ["dbdown", "partition", "az"],
  pix: ["dbdown", "partition", "xregion"],
  "mercado-livre": ["t10", "dbdown", "redis"],
  amazon: ["t100", "dbdown", "az"],
  stripe: ["dbdown", "partition", "dblat"],
  dropbox: ["disk", "corrupt", "partition"],
  ticketmaster: ["t100", "spike", "redis"],
  "free-fire": ["spike", "t100", "partition"],
  shopee: ["t100", "dbdown", "redis"],
  itau: ["dbdown", "partition", "az", "dblat"]
};
const DBS = ["sql-database", "nosql-database"], APPS = ["backend", "microservice"], ENTRY = ["api-gateway", "load-balancer"], LOGS = ["kafka", "queue"];
function pathsFor(needs) {
  const has = (t2) => needs.some((n) => n.any.length === 1 && n.any[0] === t2);
  const out = [{ label: "Escrita chega ao banco, passando pelo serviço", seq: [APPS, DBS], op: "write", why: "Todo dado novo precisa de um caminho até o armazenamento durável." }];
  if (has("redis")) out.push({ label: "Leitura passa pelo cache antes do banco", seq: [["redis"], DBS], op: "read", why: "O cache só protege o banco se estiver antes dele no fluxo de leitura (cache-aside)." });
  if (needs.some((n) => n.any.some((t2) => LOGS.includes(t2)))) out.push({ label: "Serviço publica no log ou fila", seq: [APPS, LOGS], why: "O produtor publica o evento e segue; o consumo acontece de forma assíncrona." });
  if (has("cdn") && has("object-storage")) out.push({ label: "Mídia sai do object storage pela CDN", seq: [["cdn"], ["object-storage"]], op: "read", why: "A CDN busca na origem só em caso de miss; o object storage guarda os bytes." });
  if (has("search-engine")) out.push({ label: "Busca passa pelo índice", seq: [APPS, ["search-engine"]], op: "read", why: "Consultas por texto vão ao índice, não ao banco transacional." });
  if (has("websocket")) out.push({ label: "Conexão persistente chega ao serviço", seq: [["websocket"], APPS], why: "A conexão aberta entrega eventos em tempo real sem polling." });
  if (needs.some((n) => n.any.some((t2) => ENTRY.includes(t2)))) out.push({ label: "Entrada distribui carga antes do serviço", seq: [ENTRY, APPS], why: "O tráfego passa por um ponto de entrada antes de chegar às instâncias." });
  return out;
}
const checksOf = (id) => {
  const c = CHECKS[id];
  if (!c) return void 0;
  return { ...c, chaos: CHAOS_HINTS[id], paths: pathsFor(c.needs), minHitRate: c.needs.some((n) => n.any.includes("redis")) ? 0.8 : void 0 };
};
const sessionFor = (c) => ({ mode: "study", title: c.title, caseId: c.id, summary: c.summary, requirements: caseRequirements(c), load: loadOf(c.id), checks: checksOf(c.id) });
const uid = (prefix, taken) => {
  let i = 1;
  while (taken.has(`${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
};
function addStep(flow, n) {
  const id = uid(`${flow.id}-s`, new Set(flow.steps.map((s) => s.id)));
  const step = {
    id,
    nodeId: n.nodeId,
    ordinal: flow.steps.filter((s) => s.parentStepId === n.parent.id).length,
    operationClass: n.operationClass,
    visitsPerRequest: n.visits,
    branchShare: n.missOf ? n.missShare ?? 1 : 1,
    condition: n.missOf ? "cache-miss" : "always",
    join: n.isCacheLookup ? "alternative" : "serial",
    required: !n.isCacheLookup,
    parentStepId: n.parent.id,
    edgeId: n.edgeId,
    conditionStepId: n.missOf?.id
  };
  const steps = [...flow.steps, step];
  return { ...flow, steps, ackStepId: n.isCacheLookup ? flow.ackStepId : id };
}
const SOURCE_TYPES = /* @__PURE__ */ new Set(["client", "web-app", "mobile-app", "iot-device", "external-system"]);
const SIDE_TYPES = /* @__PURE__ */ new Set(["observability", "secrets-manager", "service-discovery", "dns"]);
const DB_TYPES = /* @__PURE__ */ new Set(["sql-database", "nosql-database", "database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"]);
const MSG_TYPES = /* @__PURE__ */ new Set(["kafka", "queue", "mqtt-broker", "event-bus"]);
const OP_BY_TYPE = {
  kafka: "message",
  queue: "message",
  "mqtt-broker": "message",
  "event-bus": "message",
  "notification-service": "message",
  redis: "read",
  cdn: "read",
  "object-storage": "read",
  "search-engine": "read"
};
const roleOf = (type) => type === "redis" || DB_TYPES.has(type) ? "data" : MSG_TYPES.has(type) ? "events" : type === "search-engine" ? "search" : type === "object-storage" || type === "cdn" ? "media" : type === "notification-service" ? "notify" : type === "websocket" ? "realtime" : "next";
const AUTO_LABEL = { read: "Leitura", write: "Escrita", events: "Eventos", search: "Busca", media: "Mídia", notify: "Notificações", realtime: "Tempo real" };
function buildAutoFlows(rootId, nodes2, edges2, hitRate = 0.9, budget) {
  const typeOf = new Map(nodes2.map((n) => [n.id, n.type]));
  const out = /* @__PURE__ */ new Map();
  for (const e of edges2) if (typeOf.has(e.source) && typeOf.has(e.target)) out.set(e.source, [...out.get(e.source) ?? [], e]);
  const variants = (nodeId, seen) => {
    if (budget && --budget.remaining < 0) throw new Error("O desenho excede o limite de caminhos da avaliação.");
    const kids = (out.get(nodeId) ?? []).filter((e) => !seen.has(e.target) && !SIDE_TYPES.has(typeOf.get(e.target) ?? ""));
    if (!kids.length || MSG_TYPES.has(typeOf.get(nodeId) ?? "")) return [{ edges: [], keys: [] }];
    const data = kids.filter((e) => roleOf(typeOf.get(e.target) ?? "") === "data");
    const result = [];
    if (data.length) {
      const cache = data.filter((e) => typeOf.get(e.target) === "redis"), dbs = data.filter((e) => DB_TYPES.has(typeOf.get(e.target) ?? ""));
      result.push({ edges: [...cache, ...dbs], keys: ["read"] });
      if (dbs.length) result.push({ edges: dbs, keys: ["write"] });
    }
    for (const e of kids.filter((x) => roleOf(typeOf.get(x.target) ?? "") !== "data")) {
      const role = roleOf(typeOf.get(e.target) ?? "");
      for (const v of variants(e.target, /* @__PURE__ */ new Set([...seen, e.target]))) result.push({ edges: [e, ...v.edges], keys: role === "next" ? v.keys : [role, ...v.keys] });
    }
    return result;
  };
  const used = /* @__PURE__ */ new Map();
  const flows = [];
  for (const v of variants(rootId, /* @__PURE__ */ new Set([rootId]))) {
    if (!v.edges.length) continue;
    const write = v.keys.includes("write");
    const base = `auto-${rootId}-${v.keys.join("-") || "main"}`;
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    const rootStep = { id: `${id}-s1`, nodeId: rootId, ordinal: 0, operationClass: "compute", visitsPerRequest: 1, branchShare: 1, condition: "always", join: "serial", required: true };
    let flow = { id, workloadId: `wl-${id}`, ackStepId: rootStep.id, steps: [rootStep] };
    const stepOf = /* @__PURE__ */ new Map([[rootId, rootStep]]);
    let cacheStep;
    for (const e of v.edges) {
      const type = typeOf.get(e.target) ?? "";
      const parent = stepOf.get(e.source);
      if (!parent) continue;
      const isCache = type === "redis" && !write;
      const isMiss = DB_TYPES.has(type) && !write && !!cacheStep && cacheStep.parentStepId === parent.id;
      flow = addStep(flow, {
        parent,
        nodeId: e.target,
        edgeId: e.id,
        operationClass: DB_TYPES.has(type) ? write ? "write" : "read" : OP_BY_TYPE[type] ?? "compute",
        visits: 1,
        isCacheLookup: isCache,
        missOf: isMiss ? cacheStep : void 0,
        missShare: isMiss ? 1 - hitRate : void 0
      });
      const step = flow.steps[flow.steps.length - 1];
      stepOf.set(e.target, step);
      if (isCache) cacheStep = step;
    }
    const names = v.keys.filter((k, i) => k !== v.keys[i - 1]).map((k) => AUTO_LABEL[k] ?? k);
    flows.push({
      flow,
      name: names.join(" · ") || "Fluxo",
      write,
      weight: write ? 0.6 : v.keys.includes("read") || !v.keys.length ? 1 : 0.5,
      workload: { id: `wl-${id}`, operationId: id, source: "external", averageRps: 1e3, peakRps: 5e3, payloadBytes: 500, deadlineMs: 500, mutable: false, manual: false }
    });
  }
  const count = /* @__PURE__ */ new Map();
  for (const f of flows) count.set(f.name, (count.get(f.name) ?? 0) + 1);
  const nameOf = new Map(nodes2.map((n) => [n.id, n.name]));
  for (const f of flows) if ((count.get(f.name) ?? 0) > 1) f.name = `${f.name} · ${nameOf.get(f.flow.steps[1]?.nodeId ?? "") ?? ""}`.trim();
  return flows;
}
const schemaVersion = "1.0.0";
const nodes = [{ "id": "client", "type": "client", "componentVersion": "1.0.0", "name": "client", "properties": { "profileId": "source-v1", "replicas": 1, "placements": [{ "region": "region-a", "zone": "zone-a", "count": 1 }], "policy": { "tls": true, "authRequired": false, "durable": false, "idempotent": true, "metrics": true, "logs": true, "traces": true, "alerts": true, "consistency": "not-applicable" } } }, { "id": "lb", "type": "load-balancer", "componentVersion": "1.0.0", "name": "lb", "properties": { "profileId": "lb-standard-v1", "replicas": 1, "placements": [{ "region": "region-a", "zone": "zone-a", "count": 1 }], "policy": { "tls": true, "authRequired": false, "durable": false, "idempotent": true, "metrics": true, "logs": true, "traces": true, "alerts": true, "consistency": "not-applicable" } } }, { "id": "app", "type": "backend", "componentVersion": "1.0.0", "name": "app", "properties": { "profileId": "compute-standard-v1", "replicas": 3, "placements": [{ "region": "region-a", "zone": "zone-a", "count": 1 }, { "region": "region-a", "zone": "zone-b", "count": 2 }], "policy": { "tls": true, "authRequired": false, "durable": false, "idempotent": true, "metrics": true, "logs": true, "traces": true, "alerts": true, "consistency": "not-applicable" } } }, { "id": "cache", "type": "redis", "componentVersion": "1.0.0", "name": "cache", "properties": { "profileId": "cache-standard-v1", "replicas": 1, "placements": [{ "region": "region-a", "zone": "zone-a", "count": 1 }], "policy": { "tls": true, "authRequired": false, "durable": false, "idempotent": true, "metrics": true, "logs": true, "traces": true, "alerts": true, "consistency": "not-applicable" }, "cache": { "hitRate": 0.9, "invalidation": "ttl", "ttlSec": 60, "failureMode": "bypass", "workingSetMiB": 256, "coalescing": false, "warmupSec": 0 } } }, { "id": "db", "type": "sql-database", "componentVersion": "1.0.0", "name": "db", "properties": { "profileId": "sql-standard-v1", "replicas": 1, "placements": [{ "region": "region-a", "zone": "zone-a", "count": 1 }], "policy": { "tls": true, "authRequired": true, "durable": true, "idempotent": true, "metrics": true, "logs": true, "traces": true, "alerts": true, "consistency": "strong" }, "storage": { "recordBytes": 500, "initialRecords": 1e6, "retentionDays": 365, "replicationFactor": 1, "indexOverheadFactor": 1.3 }, "replication": { "mode": "none", "role": "primary", "lagMs": 0, "failoverEnabled": false, "failoverDelaySec": 0 } } }];
const edges = [{ "id": "client-lb", "source": "client", "sourcePort": "out", "target": "lb", "targetPort": "in", "configuration": { "mode": "sync", "protocol": "https", "required": true, "timeoutMs": 500, "networkLatencyMs": 1, "maxAttempts": 1, "backoffMs": 0, "retryable": false, "tls": true } }, { "id": "lb-app", "source": "lb", "sourcePort": "out", "target": "app", "targetPort": "in", "configuration": { "mode": "sync", "protocol": "https", "required": true, "timeoutMs": 500, "networkLatencyMs": 1, "maxAttempts": 1, "backoffMs": 0, "retryable": false, "tls": true } }, { "id": "app-cache", "source": "app", "sourcePort": "out", "target": "cache", "targetPort": "in", "configuration": { "mode": "sync", "protocol": "redis", "required": false, "timeoutMs": 5, "networkLatencyMs": 1, "maxAttempts": 1, "backoffMs": 0, "retryable": false, "tls": true } }, { "id": "app-db", "source": "app", "sourcePort": "out", "target": "db", "targetPort": "in", "configuration": { "mode": "sync", "protocol": "sql", "required": true, "timeoutMs": 500, "networkLatencyMs": 1, "maxAttempts": 1, "backoffMs": 0, "retryable": false, "tls": true } }];
const metadata = { "title": "Links curtos — experimento cache-aside", "challengeId": "ch-url", "challengeVersion": "1.0.0", "createdAt": "2026-10-03T01:00:00Z", "locale": "pt-BR", "decisions": [{ "id": "decision-cache", "title": "Cache-aside com TTL", "rationale": "Leituras toleram 60 segundos stale. Bypass em falha mantém serviço até o limite do banco. Ramo miss é coordenado pela aplicação.", "nodeIds": ["cache", "db"], "requirementIds": ["NFR-URL-1"] }], "requirementEvidence": [{ "requirementId": "FR-URL-2", "kind": "flow", "refId": "flow-redirect", "explanation": "Lookup com miss seguido de leitura durável.", "selfDeclared": false }] };
const traffic = { "workloads": [{ "id": "wl-redirect", "operationId": "redirect", "source": "external", "averageRps": 1e3, "peakRps": 5e3, "payloadBytes": 500, "concurrentConnections": 1e4, "deadlineMs": 500, "mutable": false, "manual": false }], "flows": [{ "id": "flow-redirect", "workloadId": "wl-redirect", "ackStepId": "s-cache", "steps": [{ "id": "s-client", "nodeId": "client", "ordinal": 0, "operationClass": "compute", "visitsPerRequest": 1, "branchShare": 1, "condition": "always", "join": "serial", "required": true }, { "id": "s-lb", "nodeId": "lb", "ordinal": 0, "operationClass": "compute", "visitsPerRequest": 1, "branchShare": 1, "condition": "always", "join": "serial", "required": true, "parentStepId": "s-client", "edgeId": "client-lb" }, { "id": "s-app", "nodeId": "app", "ordinal": 0, "operationClass": "compute", "visitsPerRequest": 1, "branchShare": 1, "condition": "always", "join": "serial", "required": true, "parentStepId": "s-lb", "edgeId": "lb-app" }, { "id": "s-cache", "nodeId": "cache", "ordinal": 0, "operationClass": "read", "visitsPerRequest": 1, "branchShare": 1, "condition": "always", "join": "alternative", "required": false, "parentStepId": "s-app", "edgeId": "app-cache" }, { "id": "s-db", "nodeId": "db", "ordinal": 0, "operationClass": "read", "visitsPerRequest": 1, "branchShare": 0.1, "condition": "cache-miss", "join": "serial", "required": true, "parentStepId": "s-app", "edgeId": "app-db", "conditionStepId": "s-cache" }] }] };
const dependencies = [{ "id": "dep-lb", "edgeId": "client-lb", "operationId": "redirect", "semantics": "required" }, { "id": "dep-app", "edgeId": "lb-app", "operationId": "redirect", "semantics": "required" }, { "id": "dep-cache", "edgeId": "app-cache", "operationId": "redirect", "semantics": "degradable" }, { "id": "dep-db", "edgeId": "app-db", "operationId": "redirect", "semantics": "required" }];
const configuration = { "catalogVersion": "1.0.0", "rulesetVersion": "1.0.0", "engineVersion": "1.0.0", "seed": 42, "durationSec": 300, "tickSec": 1, "loadMode": "peak", "events": [{ "id": "ev-cache-fail", "type": "redis-unavailable", "targetKind": "node", "targetId": "cache", "startSec": 60, "durationSec": 30, "magnitude": 1, "recoverySec": 0 }] };
const layout = { "positions": [{ "nodeId": "client", "x": 0, "y": 150 }, { "nodeId": "lb", "x": 200, "y": 150 }, { "nodeId": "app", "x": 400, "y": 150 }, { "nodeId": "cache", "x": 650, "y": 0 }, { "nodeId": "db", "x": 650, "y": 300 }], "groups": [], "viewport": { "x": 0, "y": 0, "zoom": 1 } };
const fixture = {
  schemaVersion,
  nodes,
  edges,
  metadata,
  traffic,
  dependencies,
  configuration,
  layout
};
const t = (key, values = {}) => key.replace(/\{(\w+)\}/g, (all, k) => String(values[k] ?? all));
function docOf(s) {
  const original = fixture;
  const nodes2 = s.n.map((n) => ({
    id: n.id,
    type: n.d.type,
    componentVersion: "1.0.0",
    name: n.d.name,
    properties: {
      policy: {},
      profileId: DEFAULT_PROFILE_BY_TYPE[n.d.type] ?? "unresolved",
      replicas: n.d.replicas,
      placements: [{ region: "region-a", zone: "zone-a", count: n.d.replicas }],
      ...n.d.type === "redis" ? { cache: { hitRate: n.d.hitRate ?? 0.8, invalidation: "ttl", ttlSec: 60, failureMode: "bypass", workingSetMiB: 256, coalescing: false, warmupSec: 0 } } : {}
    }
  }));
  return { ...original, nodes: nodes2, edges: s.e, traffic: { ...original.traffic, workloads: s.w, flows: s.f } };
}
function weightsOf(flows, meta, readPct) {
  const isWrite = (f) => f.steps.some((s) => s.operationClass === "write");
  const reads = flows.filter((f) => !isWrite(f)), writes = flows.filter(isWrite);
  const wShare = writes.length ? reads.length ? 1 - readPct / 100 : 1 : 0;
  const out = {};
  const spread = (group, share) => {
    const sum = group.reduce((a, f) => a + (meta[f.id]?.weight ?? 1), 0);
    for (const f of group) out[f.id] = sum > 0 ? share * (meta[f.id]?.weight ?? 1) / sum : 0;
  };
  spread(reads, 1 - wShare);
  spread(writes, wShare);
  return out;
}
function evaluate(session, d) {
  const out = [];
  const empty = d.nodes.length === 0;
  const inFlow = new Set(d.flows.flatMap((f) => f.steps.map((s) => s.nodeId)));
  const loaded = [...d.loads.entries()].filter(([, l]) => !l.source && l.utilization !== null);
  const worst = loaded.reduce((w, [id, l]) => !w || (l.utilization ?? 0) > w[1] ? [id, l.utilization ?? 0] : w, null);
  const nameOf = (id) => d.nodes.find((n) => n.id === id)?.name ?? id;
  out.push({
    id: "capacity",
    label: t("Capacidade no pico, sem componente saturado"),
    detail: worst ? t("Mais carregado: {nome} a {pct}%.", { nome: nameOf(worst[0]), pct: Math.round(worst[1] * 100) }) : t("Monte o desenho e defina um fluxo para medir."),
    status: !worst ? "unknown" : worst[1] > 1 ? "fails" : worst[1] > 0.8 ? "partial" : "meets"
  });
  const flowNodes = d.nodes.filter((n) => inFlow.has(n.id) && !n.properties?.source && !["client", "web-app", "mobile-app", "iot-device", "external-system"].includes(n.type));
  const single = flowNodes.filter((n) => (n.properties?.replicas ?? 1) < 2);
  out.push({
    id: "spof",
    label: t("Sem ponto único de falha"),
    detail: !flowNodes.length ? t("Sem componentes em fluxos ainda.") : single.length ? t("Com 1 réplica: {lista}.", { lista: single.map((n) => n.name).join(", ") }) : t("Todo componente do fluxo tem 2 ou mais réplicas."),
    status: !flowNodes.length ? "unknown" : single.length ? "fails" : "meets"
  });
  const target = session.checks?.p95Ms;
  if (target) {
    const lowSuccess = d.readSuccess !== null && d.readSuccess !== void 0 && d.readSuccess < 0.99;
    out.push({
      id: "p95",
      label: t("Latência p95 ≤ {ms} ms", { ms: target }),
      detail: d.p95Ms === null ? t("Sem fluxo de leitura com carga.") : lowSuccess ? t("Só {pct}% das leituras conclui no prazo; a latência de quem sobrevive não basta.", { pct: Math.round((d.readSuccess ?? 0) * 100) }) : t("p95 proxy atual: {ms} ms.", { ms: Math.round(d.p95Ms) }),
      status: d.p95Ms === null ? "unknown" : lowSuccess || d.p95Ms > target ? "fails" : "meets"
    });
  }
  for (const need of session.checks?.needs ?? []) {
    const has = d.nodes.some((n) => need.any.includes(n.type));
    out.push({ id: `need:${need.label}`, label: t(need.label), detail: t(need.why), status: empty ? "unknown" : has ? "meets" : "fails" });
  }
  for (const rule of session.checks?.paths ?? []) {
    const ok = pathMatches(d.flows, d.nodes, rule);
    out.push({ id: `path:${rule.label}`, label: t(rule.label), detail: t(rule.why), status: empty || !d.flows.length ? "unknown" : ok ? "meets" : "fails" });
  }
  const minHit = session.checks?.minHitRate;
  const caches = d.nodes.filter((n) => n.type === "redis");
  if (minHit && caches.length) {
    const hits = caches.map((n) => n.properties?.cache?.hitRate).filter((h) => typeof h === "number");
    const best = hits.length ? Math.max(...hits) : null;
    out.push({
      id: "hit",
      label: t("Taxa de acerto do cache ≥ {pct}%", { pct: Math.round(minHit * 100) }),
      detail: best === null ? t("Defina a taxa em Propriedades do cache.") : t("Taxa atual: {pct}%.", { pct: Math.round(best * 100) }),
      status: best === null ? "unknown" : best >= minHit ? "meets" : "fails"
    });
  }
  return out;
}
function pathMatches(flows, nodes2, rule) {
  const typeOf = (id) => nodes2.find((n) => n.id === id)?.type;
  for (const f of flows) {
    const byId = new Map(f.steps.map((s) => [s.id, s]));
    for (const step of f.steps) {
      const chain = [];
      const up = (id) => {
        const s = id ? byId.get(id) : void 0;
        if (!s) return;
        up(s.parentStepId);
        chain.push(s.nodeId);
      };
      up(step.parentStepId);
      if (step.conditionStepId) {
        const c = byId.get(step.conditionStepId);
        if (c) chain.push(c.nodeId);
      }
      chain.push(step.nodeId);
      if (rule.op && step.operationClass !== rule.op) continue;
      let i = 0;
      for (const id of chain) {
        if (i < rule.seq.length && rule.seq[i].includes(typeOf(id) ?? "")) i++;
      }
      if (i === rule.seq.length) return true;
    }
  }
  return false;
}
const WEIGHTS = { cap: 0.25, res: 0.2, arq: 0.2, lat: 0.15, com: 0.1, efi: 0.1 };
const SOURCE = /* @__PURE__ */ new Set(["client", "web-app", "mobile-app", "iot-device", "external-system"]);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pts = (v) => Math.round(99 * clamp(v));
const pct = (v) => Math.round(v * 100);
const tierOf = (overall) => overall >= 90 ? "elite" : overall >= 75 ? "gold" : overall >= 60 ? "silver" : "bronze";
function lossErrors(doc, rps, weights, baseErr) {
  const out = {};
  const inFlow = new Set(doc.traffic.flows.flatMap((f) => f.steps.map((s) => s.nodeId)));
  for (const n of doc.nodes) {
    if (!inFlow.has(n.id) || SOURCE.has(n.type)) continue;
    const r = n.properties?.replicas ?? 1;
    const effect = r <= 1 ? { unavailable: true } : { capacityFactor: (r - 1) / r };
    const res = solveDemand(doc, { rps, weights, effects: { nodes: { [n.id]: effect } } });
    out[n.id] = Math.max(0, errorOf(res) - baseErr);
  }
  return out;
}
function errorOf(res) {
  let o = 0, c = 0;
  for (const f of res.flows.values()) {
    o += f.offered;
    c += f.completed;
  }
  return o > 0 ? Math.max(0, 1 - c / o) : 0;
}
function rate(inp) {
  const nameOf = (id) => inp.nodes.find((n) => n.id === id)?.name ?? id;
  const inFlow = new Set(inp.flows.flatMap((f) => f.steps.map((s) => s.nodeId)));
  const flowNodes = inp.nodes.filter((n) => inFlow.has(n.id) && !SOURCE.has(n.type));
  const reps = (n) => n.properties?.replicas ?? 1;
  const attrs = [];
  const add = (id, abbr, label, score, why, tip) => attrs.push({ id, abbr, label, weight: WEIGHTS[id], score, why, tip });
  const loaded = [...inp.loads.entries()].filter(([id, l]) => !l.source && l.utilization !== null && inFlow.has(id));
  if (!loaded.length) add("cap", "CAP", t("Capacidade"), null, t("Defina um fluxo e simule para medir."));
  else {
    const [wid, wl] = loaded.reduce((a, b) => (b[1].utilization ?? 0) > (a[1].utilization ?? 0) ? b : a);
    const u = wl.utilization ?? 0;
    const base = u <= 0.7 ? 1 : u <= 1 ? 1 - (u - 0.7) / 0.3 * 0.4 : clamp(0.6 - (u - 1) * 0.6);
    add(
      "cap",
      "CAP",
      t("Capacidade"),
      pts(base * (1 - Math.min(0.8, inp.errFrac * 4))),
      t("Mais carregado: {nome} a {pct}%; erro de {erro}%.", { nome: nameOf(wid), pct: pct(u), erro: (inp.errFrac * 100).toFixed(1) }),
      u > 0.8 || inp.errFrac > 1e-3 ? t("Dê mais réplicas ou um cache a {nome}.", { nome: nameOf(wid) }) : void 0
    );
  }
  if (!flowNodes.length) add("res", "RES", t("Resiliência"), null, t("Sem componentes em fluxos ainda."));
  else {
    const pass = flowNodes.filter((n) => (inp.lossErr[n.id] ?? 1) <= 0.02);
    const redundant = flowNodes.filter((n) => reps(n) >= 2);
    const worst = flowNodes.reduce((a, b) => (inp.lossErr[b.id] ?? 1) > (inp.lossErr[a.id] ?? 1) ? b : a);
    const w = inp.lossErr[worst.id] ?? 1;
    add(
      "res",
      "RES",
      t("Resiliência"),
      pts(0.7 * (pass.length / flowNodes.length) + 0.3 * (redundant.length / flowNodes.length)),
      w > 0.02 ? t("Perder uma instância de {nome} derruba {pct}% das requisições.", { nome: nameOf(worst.id), pct: pct(w) }) : t("O sistema aguenta perder uma instância de qualquer componente."),
      w > 0.02 ? reps(worst) < 2 ? t("Dê 2 ou mais réplicas a {nome}.", { nome: nameOf(worst.id) }) : t("Folga a {nome}: sem ela, perder uma instância satura o resto.", { nome: nameOf(worst.id) }) : void 0
    );
  }
  if (inp.p95Ms === null) add("lat", "LAT", t("Latência"), null, t("Sem fluxo de leitura com carga."));
  else {
    const p = inp.p95Ms;
    let s;
    if (inp.p95Target) {
      const r = p / inp.p95Target;
      s = r <= 0.5 ? 1 : r <= 1 ? 1 - (r - 0.5) * 0.28 : r <= 2 ? 0.85 - (r - 1) * 0.45 : 0.2;
    } else s = p <= 100 ? 1 : p <= 200 ? 1 - (p - 100) / 100 * 0.15 : p <= 500 ? 0.85 - (p - 200) / 300 * 0.3 : p <= 1e3 ? 0.55 - (p - 500) / 500 * 0.35 : 0.1;
    add(
      "lat",
      "LAT",
      t("Latência"),
      pts(s),
      inp.p95Target ? t("p95 de {ms} ms para uma meta de {meta} ms.", { ms: Math.round(p), meta: inp.p95Target }) : t("p95 de {ms} ms.", { ms: Math.round(p) }),
      s < 0.85 ? t("Reduza saltos no caminho ou tire o gargalo do caminho crítico.") : void 0
    );
  }
  const rule = inp.checks.filter((c) => c.id.startsWith("need:") || c.id.startsWith("path:") || c.id === "hit");
  if (rule.length) {
    const met = rule.reduce((a, c) => a + (c.status === "meets" ? 1 : c.status === "partial" ? 0.5 : 0), 0);
    const miss = rule.filter((c) => c.status !== "meets");
    add(
      "arq",
      "ARQ",
      t("Arquitetura"),
      pts(met / rule.length),
      t("{a} de {b} requisitos de arquitetura atendidos.", { a: Math.floor(met), b: rule.length }),
      miss.length ? t("Falta: {item}.", { item: miss[0].label }) : void 0
    );
  } else if (!inp.nodes.length) add("arq", "ARQ", t("Arquitetura"), null, t("Monte o desenho para avaliar."));
  else {
    const types = new Set(inp.nodes.map((n) => n.type));
    const good = [
      [inp.flows.length > 0, t("tem fluxo definido")],
      [["sql-database", "nosql-database", "database"].some((x) => types.has(x)), t("guarda os dados em um banco")],
      [types.has("load-balancer") || types.has("api-gateway"), t("tem ponto de entrada")],
      [inp.readPct < 80 || types.has("redis") || types.has("cdn"), t("protege a leitura com cache ou CDN")],
      [inp.nodes.filter((n) => ["backend", "microservice"].includes(n.type)).every((n) => reps(n) >= 2) && types.has("backend"), t("serviços com réplicas")]
    ];
    const ok = good.filter(([c]) => c);
    const falta = good.find(([c]) => !c);
    add("arq", "ARQ", t("Arquitetura"), pts(ok.length / good.length), t("Boas práticas básicas: {a} de {b}.", { a: ok.length, b: good.length }), falta ? t("Falta: {item}.", { item: falta[1] }) : void 0);
  }
  if (!inp.edges.length) add("com", "COM", t("Comunicação"), null, t("Ligue os componentes para avaliar."));
  else {
    const sync = /* @__PURE__ */ new Map();
    for (const e of inp.edges) if (e.configuration.mode === "sync") sync.set(e.source, [...sync.get(e.source) ?? [], e.target]);
    const memo = /* @__PURE__ */ new Map();
    const depth = (id, seen) => {
      if (memo.has(id)) return memo.get(id);
      if (seen.has(id)) return 0;
      const d = 1 + Math.max(0, ...(sync.get(id) ?? []).map((x) => depth(x, /* @__PURE__ */ new Set([...seen, id]))));
      memo.set(id, d);
      return d;
    };
    const maxDepth = Math.max(...inp.nodes.map((n) => depth(n.id, /* @__PURE__ */ new Set())));
    const fan = inp.nodes.map((n) => ({ n, k: (sync.get(n.id) ?? []).filter((x) => !["redis", "sql-database", "nosql-database", "database", "timeseries-db", "graph-db", "vector-db", "data-warehouse"].includes(inp.nodes.find((m) => m.id === x)?.type ?? "")).length })).filter((x) => x.k > 4);
    const insecure = inp.edges.filter((e) => SOURCE.has(inp.nodes.find((n) => n.id === e.source)?.type ?? "") && e.configuration.tls === false);
    const score = 1 - Math.max(0, maxDepth - 6) * 0.09 - fan.length * 0.06 - insecure.length * 0.1;
    const issues = [maxDepth > 6 ? t("{n} chamadas síncronas em cadeia", { n: maxDepth }) : "", fan.length ? t("{nome} chama {n} serviços", { nome: fan[0].n.name, n: fan[0].k }) : "", insecure.length ? t("entrada sem TLS") : ""].filter(Boolean);
    add(
      "com",
      "COM",
      t("Comunicação"),
      pts(score),
      issues.length ? t("Atenção: {lista}.", { lista: issues.join("; ") }) : t("Cadeia de {n} chamadas síncronas, sem excesso de acoplamento.", { n: maxDepth }),
      issues.length ? t("Quebre cadeias longas com filas ou agregue chamadas.") : void 0
    );
  }
  const used = flowNodes.filter((n) => inp.loads.get(n.id)?.utilization != null);
  if (!used.length) add("efi", "EFI", t("Eficiência"), null, t("Sem carga para medir uso."));
  else {
    const idle = used.filter((n) => reps(n) >= 3 && (inp.loads.get(n.id).utilization ?? 0) < 0.2);
    const o = idle[0];
    add(
      "efi",
      "EFI",
      t("Eficiência"),
      pts(1 - idle.length / used.length * 1.5),
      o ? t("{nome} usa {r} réplicas com só {pct}% de uso.", { nome: o.name, r: reps(o), pct: pct(inp.loads.get(o.id).utilization ?? 0) }) : t("Réplicas proporcionais à carga."),
      o ? t("Reduza as réplicas de {nome}: o custo sobe sem ganho.", { nome: o.name }) : void 0
    );
  }
  const have = attrs.filter((a) => a.score !== null);
  if (have.length < 2) return { overall: null, tier: null, attrs };
  const wsum = have.reduce((a, x) => a + x.weight, 0);
  const overall = Math.round(have.reduce((a, x) => a + x.score * x.weight, 0) / wsum);
  return { overall, tier: tierOf(overall), attrs };
}
const MORE = {
  "sql-database": [{ id: "aurora", name: "Amazon Aurora", hex: "#64748b" }, { id: "rds", name: "Amazon RDS", hex: "#64748b" }, { id: "cloudsql", name: "Google Cloud SQL", hex: "#64748b" }, { id: "azure-sql", name: "Azure SQL", hex: "#64748b" }, { id: "sqlserver", name: "Microsoft SQL Server", hex: "#64748b" }, { id: "oracle-db", name: "Oracle Database", hex: "#64748b" }, { id: "planetscale", name: "PlanetScale", hex: "#64748b" }, { id: "tidb", name: "TiDB", hex: "#64748b" }, { id: "yugabytedb", name: "YugabyteDB", hex: "#64748b" }, { id: "vitess", name: "Vitess", hex: "#64748b" }, { id: "spanner", name: "Google Cloud Spanner", hex: "#64748b" }, { id: "turso", name: "Turso", hex: "#64748b" }],
  "nosql-database": [{ id: "cosmosdb", name: "Azure Cosmos DB", hex: "#64748b" }, { id: "firestore", name: "Google Firestore", hex: "#64748b" }, { id: "scylladb", name: "ScyllaDB", hex: "#64748b" }, { id: "hbase", name: "Apache HBase", hex: "#64748b" }, { id: "documentdb", name: "Amazon DocumentDB", hex: "#64748b" }, { id: "ravendb", name: "RavenDB", hex: "#64748b" }, { id: "foundationdb", name: "FoundationDB", hex: "#64748b" }, { id: "redis", name: "Redis", hex: "#64748b" }, { id: "elasticsearch", name: "Elasticsearch", hex: "#64748b" }, { id: "dgraph", name: "Dgraph", hex: "#64748b" }],
  "redis": [{ id: "elasticache", name: "Amazon ElastiCache", hex: "#64748b" }, { id: "dragonfly", name: "Dragonfly", hex: "#64748b" }, { id: "keydb", name: "KeyDB", hex: "#64748b" }, { id: "hazelcast", name: "Hazelcast", hex: "#64748b" }, { id: "azure-redis", name: "Azure Cache for Redis", hex: "#64748b" }, { id: "aerospike", name: "Aerospike", hex: "#64748b" }],
  "kafka": [{ id: "msk", name: "Amazon MSK", hex: "#64748b" }, { id: "confluent", name: "Confluent", hex: "#64748b" }, { id: "azure-eventhubs", name: "Azure Event Hubs", hex: "#64748b" }, { id: "pubsub", name: "Google Pub/Sub", hex: "#64748b" }, { id: "kinesis", name: "Amazon Kinesis", hex: "#64748b" }, { id: "rocketmq", name: "Apache RocketMQ", hex: "#64748b" }],
  "queue": [{ id: "sns", name: "Amazon SNS", hex: "#64748b" }, { id: "rocketmq", name: "Apache RocketMQ", hex: "#64748b" }, { id: "ibmmq", name: "IBM MQ", hex: "#64748b" }, { id: "zeromq", name: "ZeroMQ", hex: "#64748b" }, { id: "redis-streams", name: "Redis Streams", hex: "#64748b" }, { id: "azure-queue", name: "Azure Queue Storage", hex: "#64748b" }],
  "event-bus": [{ id: "sns", name: "Amazon SNS", hex: "#64748b" }, { id: "pubsub", name: "Google Pub/Sub", hex: "#64748b" }, { id: "knative", name: "Knative Eventing", hex: "#64748b" }, { id: "nats", name: "NATS JetStream", hex: "#64748b" }, { id: "rabbitmq", name: "RabbitMQ", hex: "#64748b" }],
  "backend": [{ id: "java", name: "Java", hex: "#64748b" }, { id: "kotlin", name: "Kotlin", hex: "#64748b" }, { id: "php", name: "PHP", hex: "#64748b" }, { id: "elixir", name: "Elixir / Phoenix", hex: "#64748b" }, { id: "bun", name: "Bun", hex: "#64748b" }, { id: "deno", name: "Deno", hex: "#64748b" }, { id: "flask", name: "Flask", hex: "#64748b" }, { id: "aspnet", name: "ASP.NET", hex: "#64748b" }, { id: "quarkus", name: "Quarkus", hex: "#64748b" }, { id: "micronaut", name: "Micronaut", hex: "#64748b" }, { id: "gin", name: "Gin (Go)", hex: "#64748b" }, { id: "hono", name: "Hono", hex: "#64748b" }, { id: "fastify", name: "Fastify", hex: "#64748b" }, { id: "symfony", name: "Symfony", hex: "#64748b" }, { id: "scala", name: "Scala / Play", hex: "#64748b" }, { id: "cpp", name: "C++", hex: "#64748b" }],
  "worker": [{ id: "resque", name: "Resque", hex: "#64748b" }, { id: "rq", name: "RQ (Python)", hex: "#64748b" }, { id: "hangfire", name: "Hangfire", hex: "#64748b" }, { id: "dramatiq", name: "Dramatiq", hex: "#64748b" }, { id: "asynq", name: "Asynq", hex: "#64748b" }, { id: "temporal", name: "Temporal", hex: "#64748b" }, { id: "aws-lambda-worker", name: "AWS Lambda", hex: "#64748b" }, { id: "java", name: "Java", hex: "#64748b" }],
  "api-gateway": [{ id: "apigee", name: "Apigee", hex: "#64748b" }, { id: "azure-apim", name: "Azure API Management", hex: "#64748b" }, { id: "tyk", name: "Tyk", hex: "#64748b" }, { id: "krakend", name: "KrakenD", hex: "#64748b" }, { id: "apisix", name: "Apache APISIX", hex: "#64748b" }, { id: "traefik", name: "Traefik", hex: "#64748b" }, { id: "ambassador", name: "Emissary / Ambassador", hex: "#64748b" }, { id: "cloudflare-gw", name: "Cloudflare API Shield", hex: "#64748b" }],
  "load-balancer": [{ id: "caddy", name: "Caddy", hex: "#64748b" }, { id: "apache", name: "Apache HTTP Server", hex: "#64748b" }, { id: "aws-nlb", name: "AWS NLB", hex: "#64748b" }, { id: "gcp-lb", name: "Google Cloud Load Balancing", hex: "#64748b" }, { id: "azure-lb", name: "Azure Load Balancer", hex: "#64748b" }, { id: "cloudflare-lb", name: "Cloudflare Load Balancing", hex: "#64748b" }, { id: "metallb", name: "MetalLB", hex: "#64748b" }, { id: "keepalived", name: "Keepalived", hex: "#64748b" }],
  "cdn": [{ id: "azure-cdn", name: "Azure CDN", hex: "#64748b" }, { id: "gcp-cdn", name: "Google Cloud CDN", hex: "#64748b" }, { id: "cdn77", name: "CDN77", hex: "#64748b" }, { id: "stackpath", name: "StackPath", hex: "#64748b" }, { id: "vercel", name: "Vercel Edge Network", hex: "#64748b" }, { id: "netlify", name: "Netlify", hex: "#64748b" }],
  "object-storage": [{ id: "azure-blob", name: "Azure Blob Storage", hex: "#64748b" }, { id: "r2", name: "Cloudflare R2", hex: "#64748b" }, { id: "do-spaces", name: "DigitalOcean Spaces", hex: "#64748b" }, { id: "ceph", name: "Ceph", hex: "#64748b" }, { id: "oci-storage", name: "Oracle Object Storage", hex: "#64748b" }, { id: "hdfs", name: "Hadoop HDFS", hex: "#64748b" }, { id: "seaweedfs", name: "SeaweedFS", hex: "#64748b" }],
  "search-engine": [{ id: "algolia", name: "Algolia", hex: "#64748b" }, { id: "vespa", name: "Vespa", hex: "#64748b" }, { id: "zinc", name: "ZincSearch", hex: "#64748b" }, { id: "sphinx", name: "Sphinx", hex: "#64748b" }, { id: "azure-search", name: "Azure AI Search", hex: "#64748b" }, { id: "lucene", name: "Apache Lucene", hex: "#64748b" }],
  "websocket": [{ id: "centrifugo", name: "Centrifugo", hex: "#64748b" }, { id: "firebase-rtdb", name: "Firebase Realtime Database", hex: "#64748b" }, { id: "aws-apigw-ws", name: "API Gateway WebSocket", hex: "#64748b" }, { id: "signalr", name: "SignalR", hex: "#64748b" }, { id: "phoenix-channels", name: "Phoenix Channels", hex: "#64748b" }, { id: "ws", name: "ws (Node.js)", hex: "#64748b" }],
  "dns": [{ id: "azure-dns", name: "Azure DNS", hex: "#64748b" }, { id: "ns1", name: "NS1", hex: "#64748b" }, { id: "coredns", name: "CoreDNS", hex: "#64748b" }, { id: "bind", name: "BIND", hex: "#64748b" }, { id: "powerdns", name: "PowerDNS", hex: "#64748b" }, { id: "godaddy", name: "GoDaddy", hex: "#64748b" }],
  "authentication-service": [{ id: "cognito", name: "Amazon Cognito", hex: "#64748b" }, { id: "entra", name: "Microsoft Entra ID", hex: "#64748b" }, { id: "authentik", name: "authentik", hex: "#64748b" }, { id: "ory", name: "Ory", hex: "#64748b" }, { id: "zitadel", name: "ZITADEL", hex: "#64748b" }, { id: "fusionauth", name: "FusionAuth", hex: "#64748b" }, { id: "firebase-auth", name: "Firebase Auth", hex: "#64748b" }, { id: "nextauth", name: "Auth.js (NextAuth)", hex: "#64748b" }, { id: "passport", name: "Passport.js", hex: "#64748b" }, { id: "ldap", name: "OpenLDAP / Active Directory", hex: "#64748b" }],
  "timeseries-db": [{ id: "timestream", name: "Amazon Timestream", hex: "#64748b" }, { id: "druid", name: "Apache Druid", hex: "#64748b" }, { id: "opentsdb", name: "OpenTSDB", hex: "#64748b" }, { id: "mimir", name: "Grafana Mimir", hex: "#64748b" }, { id: "thanos", name: "Thanos", hex: "#64748b" }],
  "graph-db": [{ id: "memgraph", name: "Memgraph", hex: "#64748b" }, { id: "cosmos-gremlin", name: "Azure Cosmos DB (Gremlin)", hex: "#64748b" }, { id: "nebulagraph", name: "NebulaGraph", hex: "#64748b" }],
  "vector-db": [{ id: "atlas-vector", name: "MongoDB Atlas Vector Search", hex: "#64748b" }, { id: "redis-vector", name: "Redis (vetorial)", hex: "#64748b" }, { id: "vespa", name: "Vespa", hex: "#64748b" }, { id: "lancedb", name: "LanceDB", hex: "#64748b" }, { id: "faiss", name: "FAISS", hex: "#64748b" }, { id: "azure-search", name: "Azure AI Search", hex: "#64748b" }],
  "data-warehouse": [{ id: "trino", name: "Trino", hex: "#64748b" }, { id: "druid", name: "Apache Druid", hex: "#64748b" }, { id: "pinot", name: "Apache Pinot", hex: "#64748b" }, { id: "doris", name: "Apache Doris", hex: "#64748b" }, { id: "duckdb", name: "DuckDB", hex: "#64748b" }, { id: "motherduck", name: "MotherDuck", hex: "#64748b" }, { id: "hive", name: "Apache Hive", hex: "#64748b" }],
  "batch-processor": [{ id: "hive", name: "Apache Hive", hex: "#64748b" }, { id: "trino", name: "Trino", hex: "#64748b" }, { id: "glue", name: "AWS Glue", hex: "#64748b" }, { id: "dataflow", name: "Google Dataflow", hex: "#64748b" }, { id: "dask", name: "Dask", hex: "#64748b" }, { id: "ray", name: "Ray", hex: "#64748b" }, { id: "airbyte", name: "Airbyte", hex: "#64748b" }],
  "stream-processor": [{ id: "ksqldb", name: "ksqlDB", hex: "#64748b" }, { id: "storm", name: "Apache Storm", hex: "#64748b" }, { id: "azure-sa", name: "Azure Stream Analytics", hex: "#64748b" }, { id: "dataflow", name: "Google Dataflow", hex: "#64748b" }, { id: "materialize", name: "Materialize", hex: "#64748b" }, { id: "risingwave", name: "RisingWave", hex: "#64748b" }],
  "workflow-engine": [{ id: "conductor", name: "Netflix Conductor", hex: "#64748b" }, { id: "dagster", name: "Dagster", hex: "#64748b" }, { id: "logic-apps", name: "Azure Logic Apps", hex: "#64748b" }, { id: "n8n", name: "n8n", hex: "#64748b" }, { id: "cadence", name: "Cadence", hex: "#64748b" }, { id: "luigi", name: "Luigi", hex: "#64748b" }, { id: "zeebe", name: "Zeebe", hex: "#64748b" }],
  "scheduler": [{ id: "celery-beat", name: "Celery Beat", hex: "#64748b" }, { id: "cloud-scheduler", name: "Google Cloud Scheduler", hex: "#64748b" }, { id: "systemd", name: "systemd timers", hex: "#64748b" }, { id: "jenkins", name: "Jenkins", hex: "#64748b" }, { id: "github-actions", name: "GitHub Actions", hex: "#64748b" }, { id: "hangfire", name: "Hangfire", hex: "#64748b" }],
  "kubernetes": [{ id: "rancher", name: "Rancher", hex: "#64748b" }, { id: "doks", name: "DigitalOcean Kubernetes", hex: "#64748b" }, { id: "lke", name: "Linode LKE", hex: "#64748b" }, { id: "oke", name: "Oracle OKE", hex: "#64748b" }, { id: "minikube", name: "Minikube", hex: "#64748b" }, { id: "rke2", name: "RKE2", hex: "#64748b" }],
  "container": [{ id: "lxc", name: "LXC / LXD", hex: "#64748b" }, { id: "kata", name: "Kata Containers", hex: "#64748b" }, { id: "gvisor", name: "gVisor", hex: "#64748b" }, { id: "firecracker", name: "Firecracker", hex: "#64748b" }, { id: "fargate", name: "AWS Fargate", hex: "#64748b" }, { id: "cloud-run", name: "Google Cloud Run", hex: "#64748b" }],
  "serverless": [{ id: "cloud-run", name: "Google Cloud Run", hex: "#64748b" }, { id: "fargate", name: "AWS Fargate", hex: "#64748b" }, { id: "deno-deploy", name: "Deno Deploy", hex: "#64748b" }, { id: "supabase-edge", name: "Supabase Edge Functions", hex: "#64748b" }, { id: "knative", name: "Knative", hex: "#64748b" }, { id: "openfaas", name: "OpenFaaS", hex: "#64748b" }, { id: "fly", name: "Fly.io", hex: "#64748b" }, { id: "render", name: "Render", hex: "#64748b" }, { id: "aws-amplify", name: "AWS Amplify", hex: "#64748b" }],
  "vm": [{ id: "hetzner", name: "Hetzner Cloud", hex: "#64748b" }, { id: "vultr", name: "Vultr", hex: "#64748b" }, { id: "linode", name: "Akamai (Linode)", hex: "#64748b" }, { id: "oci", name: "Oracle Cloud Compute", hex: "#64748b" }, { id: "ovh", name: "OVHcloud", hex: "#64748b" }, { id: "kvm", name: "KVM / libvirt", hex: "#64748b" }, { id: "openstack", name: "OpenStack", hex: "#64748b" }, { id: "hyperv", name: "Microsoft Hyper-V", hex: "#64748b" }],
  "ml-service": [{ id: "ollama", name: "Ollama", hex: "#64748b" }, { id: "vllm", name: "vLLM", hex: "#64748b" }, { id: "anthropic", name: "Anthropic API", hex: "#64748b" }, { id: "azure-openai", name: "Azure OpenAI", hex: "#64748b" }, { id: "bedrock", name: "Amazon Bedrock", hex: "#64748b" }, { id: "ray-serve", name: "Ray Serve", hex: "#64748b" }, { id: "bentoml", name: "BentoML", hex: "#64748b" }, { id: "onnx", name: "ONNX Runtime", hex: "#64748b" }, { id: "replicate", name: "Replicate", hex: "#64748b" }, { id: "gemini", name: "Google Gemini API", hex: "#64748b" }, { id: "groq", name: "Groq", hex: "#64748b" }],
  "observability": [{ id: "loki", name: "Grafana Loki", hex: "#64748b" }, { id: "tempo", name: "Grafana Tempo", hex: "#64748b" }, { id: "zipkin", name: "Zipkin", hex: "#64748b" }, { id: "cloudwatch", name: "Amazon CloudWatch", hex: "#64748b" }, { id: "azure-monitor", name: "Azure Monitor", hex: "#64748b" }, { id: "honeycomb", name: "Honeycomb", hex: "#64748b" }, { id: "dynatrace", name: "Dynatrace", hex: "#64748b" }, { id: "fluentd", name: "Fluentd", hex: "#64748b" }, { id: "logstash", name: "Logstash", hex: "#64748b" }, { id: "victoriametrics", name: "VictoriaMetrics", hex: "#64748b" }, { id: "signoz", name: "SigNoz", hex: "#64748b" }, { id: "pagerduty", name: "PagerDuty", hex: "#64748b" }],
  "secrets-manager": [{ id: "gcp-secrets", name: "Google Secret Manager", hex: "#64748b" }, { id: "infisical", name: "Infisical", hex: "#64748b" }, { id: "sops", name: "Mozilla SOPS", hex: "#64748b" }, { id: "external-secrets", name: "External Secrets Operator", hex: "#64748b" }, { id: "bitwarden", name: "Bitwarden Secrets Manager", hex: "#64748b" }, { id: "cyberark", name: "CyberArk", hex: "#64748b" }],
  "service-mesh": [{ id: "cilium", name: "Cilium", hex: "#64748b" }, { id: "kuma", name: "Kuma", hex: "#64748b" }, { id: "aws-appmesh", name: "AWS App Mesh", hex: "#64748b" }, { id: "open-service-mesh", name: "Open Service Mesh", hex: "#64748b" }],
  "service-discovery": [{ id: "nacos", name: "Nacos", hex: "#64748b" }, { id: "kubernetes-dns", name: "Kubernetes DNS / Services", hex: "#64748b" }, { id: "aws-cloudmap", name: "AWS Cloud Map", hex: "#64748b" }, { id: "serf", name: "HashiCorp Serf", hex: "#64748b" }],
  "rate-limiter": [{ id: "apisix", name: "Apache APISIX", hex: "#64748b" }, { id: "bucket4j", name: "Bucket4j", hex: "#64748b" }, { id: "haproxy", name: "HAProxy", hex: "#64748b" }, { id: "aws-waf", name: "AWS WAF rate rules", hex: "#64748b" }],
  "waf": [{ id: "azure-waf", name: "Azure WAF", hex: "#64748b" }, { id: "gcp-armor", name: "Google Cloud Armor", hex: "#64748b" }, { id: "fastly", name: "Fastly WAF", hex: "#64748b" }, { id: "barracuda", name: "Barracuda", hex: "#64748b" }, { id: "coraza", name: "Coraza", hex: "#64748b" }, { id: "sucuri", name: "Sucuri", hex: "#64748b" }],
  "payment-gateway": [{ id: "square", name: "Square", hex: "#64748b" }, { id: "pagarme", name: "Pagar.me", hex: "#64748b" }, { id: "mollie", name: "Mollie", hex: "#64748b" }, { id: "razorpay", name: "Razorpay", hex: "#64748b" }, { id: "klarna", name: "Klarna", hex: "#64748b" }, { id: "pagseguro", name: "PagSeguro", hex: "#64748b" }, { id: "checkout", name: "Checkout.com", hex: "#64748b" }, { id: "pix", name: "Pix (Banco Central)", hex: "#64748b" }],
  "notification-service": [{ id: "ses", name: "Amazon SES", hex: "#64748b" }, { id: "sns", name: "Amazon SNS", hex: "#64748b" }, { id: "postmark", name: "Postmark", hex: "#64748b" }, { id: "brevo", name: "Brevo", hex: "#64748b" }, { id: "vonage", name: "Vonage", hex: "#64748b" }, { id: "fcm", name: "Firebase Cloud Messaging", hex: "#64748b" }, { id: "apns", name: "Apple Push (APNs)", hex: "#64748b" }, { id: "expo", name: "Expo Push", hex: "#64748b" }, { id: "novu", name: "Novu", hex: "#64748b" }, { id: "telegram", name: "Telegram Bot API", hex: "#64748b" }, { id: "whatsapp", name: "WhatsApp Business API", hex: "#64748b" }],
  "third-party-api": [{ id: "mapbox", name: "Mapbox", hex: "#64748b" }, { id: "shopify", name: "Shopify", hex: "#64748b" }, { id: "whatsapp", name: "WhatsApp Business API", hex: "#64748b" }, { id: "discord", name: "Discord API", hex: "#64748b" }, { id: "google-oauth", name: "Google APIs", hex: "#64748b" }, { id: "spotify", name: "Spotify API", hex: "#64748b" }, { id: "twitter", name: "X (Twitter) API", hex: "#64748b" }, { id: "sendgrid", name: "SendGrid", hex: "#64748b" }, { id: "notion", name: "Notion API", hex: "#64748b" }, { id: "correios", name: "Correios / transportadora", hex: "#64748b" }],
  "external-system": [{ id: "servicenow", name: "ServiceNow", hex: "#64748b" }, { id: "workday", name: "Workday", hex: "#64748b" }, { id: "dynamics", name: "Microsoft Dynamics", hex: "#64748b" }, { id: "zendesk", name: "Zendesk", hex: "#64748b" }, { id: "shopify", name: "Shopify", hex: "#64748b" }, { id: "totvs", name: "TOTVS", hex: "#64748b" }, { id: "mainframe", name: "Mainframe (legado)", hex: "#64748b" }, { id: "erp", name: "ERP legado", hex: "#64748b" }],
  "client": [{ id: "edge", name: "Microsoft Edge", hex: "#64748b" }, { id: "brave", name: "Brave", hex: "#64748b" }, { id: "postman", name: "Postman / cURL", hex: "#64748b" }, { id: "cli", name: "Linha de comando (CLI)", hex: "#64748b" }, { id: "smart-tv", name: "Smart TV", hex: "#64748b" }, { id: "desktop-app", name: "App desktop (Electron)", hex: "#64748b" }],
  "web-app": [{ id: "nuxt", name: "Nuxt", hex: "#64748b" }, { id: "astro", name: "Astro", hex: "#64748b" }, { id: "remix", name: "Remix", hex: "#64748b" }, { id: "solidjs", name: "SolidJS", hex: "#64748b" }, { id: "htmx", name: "htmx", hex: "#64748b" }, { id: "wordpress", name: "WordPress", hex: "#64748b" }, { id: "blazor", name: "Blazor", hex: "#64748b" }, { id: "sveltekit", name: "SvelteKit", hex: "#64748b" }],
  "mobile-app": [{ id: "react-native", name: "React Native", hex: "#64748b" }, { id: "kmp", name: "Kotlin Multiplatform", hex: "#64748b" }, { id: "expo", name: "Expo", hex: "#64748b" }, { id: "swiftui", name: "SwiftUI", hex: "#64748b" }, { id: "compose", name: "Jetpack Compose", hex: "#64748b" }, { id: "maui", name: "MAUI (.NET)", hex: "#64748b" }, { id: "ionic", name: "Ionic", hex: "#64748b" }],
  "iot-device": [{ id: "esp8266", name: "ESP8266", hex: "#64748b" }, { id: "beaglebone", name: "BeagleBone", hex: "#64748b" }, { id: "jetson", name: "NVIDIA Jetson", hex: "#64748b" }, { id: "pico", name: "Raspberry Pi Pico", hex: "#64748b" }, { id: "zigbee", name: "Zigbee sensor", hex: "#64748b" }, { id: "plc", name: "PLC industrial", hex: "#64748b" }],
  "mqtt-broker": [{ id: "nanomq", name: "NanoMQ", hex: "#64748b" }, { id: "aws-iot-mqtt", name: "AWS IoT Core (MQTT)", hex: "#64748b" }, { id: "activemq-mqtt", name: "ActiveMQ Artemis", hex: "#64748b" }, { id: "solace", name: "Solace", hex: "#64748b" }],
  "edge-compute": [{ id: "fastly-compute", name: "Fastly Compute", hex: "#64748b" }, { id: "deno-deploy", name: "Deno Deploy", hex: "#64748b" }, { id: "vercel-edge", name: "Vercel Edge Functions", hex: "#64748b" }, { id: "lambda-edge", name: "Lambda@Edge", hex: "#64748b" }, { id: "akamai-edgeworkers", name: "Akamai EdgeWorkers", hex: "#64748b" }],
  "iot-gateway": [{ id: "kong", name: "Kong", hex: "#64748b" }, { id: "chirpstack", name: "ChirpStack (LoRaWAN)", hex: "#64748b" }, { id: "telegraf", name: "Telegraf", hex: "#64748b" }, { id: "mosquitto", name: "Eclipse Mosquitto", hex: "#64748b" }],
  "iot-platform": [{ id: "gcp-iot", name: "Google Cloud (Pub/Sub + IoT)", hex: "#64748b" }, { id: "ibm-watson", name: "IBM Watson IoT", hex: "#64748b" }, { id: "tago", name: "TagoIO", hex: "#64748b" }, { id: "losant", name: "Losant", hex: "#64748b" }, { id: "thingspeak", name: "ThingSpeak", hex: "#64748b" }, { id: "home-assistant", name: "Home Assistant", hex: "#64748b" }]
};
const FALLBACK_MORE = {
  "yugabytedb": "database",
  "ravendb": "database",
  "dragonfly": "local_fire_department",
  "hazelcast": "bolt",
  "confluent": "swap_horiz",
  "micronaut": "memory",
  "tyk": "api",
  "krakend": "api",
  "apisix": "speed",
  "ambassador": "alt_route",
  "metallb": "alt_route",
  "keepalived": "sync_alt",
  "cdn77": "public",
  "seaweedfs": "cloud",
  "zinc": "search",
  "sphinx": "search",
  "centrifugo": "sync_alt",
  "ns1": "language",
  "bind": "dns",
  "powerdns": "language",
  "ory": "key",
  "zitadel": "key",
  "fusionauth": "key",
  "nextauth": "vpn_key",
  "ldap": "key",
  "opentsdb": "query_stats",
  "thanos": "monitoring",
  "memgraph": "hub",
  "nebulagraph": "hub",
  "lancedb": "scatter_plot",
  "faiss": "scatter_plot",
  "pinot": "warehouse",
  "motherduck": "warehouse",
  "ray": "stacks",
  "ksqldb": "stream",
  "materialize": "stream",
  "risingwave": "stream",
  "conductor": "account_tree",
  "dagster": "account_tree",
  "cadence": "account_tree",
  "luigi": "account_tree",
  "zeebe": "account_tree",
  "systemd": "schedule",
  "minikube": "deployed_code",
  "rke2": "deployed_code",
  "lxc": "deployed_code",
  "kata": "deployed_code",
  "gvisor": "shield",
  "firecracker": "local_fire_department",
  "openfaas": "bolt",
  "kvm": "computer",
  "hyperv": "computer",
  "vllm": "psychology",
  "ray-serve": "psychology",
  "groq": "bolt",
  "zipkin": "timeline",
  "honeycomb": "visibility",
  "signoz": "visibility",
  "infisical": "lock",
  "sops": "lock",
  "external-secrets": "key",
  "cyberark": "admin_panel_settings",
  "kuma": "hub",
  "open-service-mesh": "hub",
  "nacos": "radar",
  "serf": "radar",
  "bucket4j": "speed",
  "barracuda": "shield",
  "coraza": "shield",
  "sucuri": "shield",
  "pagarme": "payments",
  "mollie": "payments",
  "pagseguro": "payments",
  "checkout": "payments",
  "ses": "mail",
  "postmark": "mail",
  "correios": "local_shipping",
  "servicenow": "support_agent",
  "workday": "badge",
  "dynamics": "business",
  "totvs": "business",
  "erp": "domain",
  "cli": "terminal",
  "smart-tv": "tv",
  "beaglebone": "developer_board",
  "plc": "memory",
  "nanomq": "cell_tower",
  "solace": "cell_tower",
  "chirpstack": "router",
  "telegraf": "router",
  "tago": "cloud",
  "losant": "cloud",
  "thingspeak": "show_chart"
};
const P = (id, name, note, hex = "#64748b") => ({ id, name, note, hex });
const SQL = [
  P("postgresql", "PostgreSQL", "Relacional, transações ACID, extensível"),
  P("mysql", "MySQL", "Relacional amplamente adotado"),
  P("mariadb", "MariaDB", "Fork comunitário do MySQL"),
  P("sqlite", "SQLite", "Embutido, arquivo único"),
  P("cockroachdb", "CockroachDB", "SQL distribuído com consistência forte"),
  P("neon", "Neon", "Postgres serverless"),
  P("supabase", "Supabase", "Postgres gerenciado com Auth e Storage")
];
const NOSQL = [
  P("mongodb", "MongoDB", "Documentos"),
  P("cassandra", "Apache Cassandra", "Wide-column, escrita escalável"),
  P("dynamodb", "Amazon DynamoDB", "Chave-valor gerenciado"),
  P("couchbase", "Couchbase", "Documentos + cache"),
  P("neo4j", "Neo4j", "Grafos"),
  P("influxdb", "InfluxDB", "Séries temporais"),
  P("clickhouse", "ClickHouse", "Colunar analítico")
];
const RUNTIMES = [
  P("nodejs", "Node.js"),
  P("go", "Go"),
  P("spring-boot", "Spring Boot"),
  P("fastapi", "FastAPI"),
  P("python", "Python"),
  P("dotnet", ".NET"),
  P("rust", "Rust"),
  P("nestjs", "NestJS"),
  P("laravel", "Laravel"),
  P("rails", "Ruby on Rails"),
  P("express", "Express"),
  P("django", "Django")
];
const PROXIES = [
  P("nginx", "NGINX"),
  P("envoy", "Envoy Proxy"),
  P("traefik", "Traefik Proxy")
];
const K8S = [
  P("kubernetes", "Kubernetes", "Orquestrador de contêineres"),
  P("eks", "Amazon EKS"),
  P("gke", "Google GKE", void 0, "#4285F4"),
  P("aks", "Azure AKS", void 0, "#0078D4"),
  P("openshift", "Red Hat OpenShift"),
  P("nomad", "HashiCorp Nomad"),
  P("ecs", "Amazon ECS"),
  P("k3s", "K3s", "Kubernetes leve para borda")
];
const VECTOR = [
  P("pinecone", "Pinecone"),
  P("weaviate", "Weaviate", void 0, "#00B140"),
  P("milvus", "Milvus"),
  P("qdrant", "Qdrant"),
  P("pgvector", "pgvector", "Extensão vetorial do PostgreSQL"),
  P("chroma", "Chroma"),
  P("elasticsearch", "Elasticsearch (kNN)")
];
const PROVIDERS = {
  client: [P("chrome", "Google Chrome"), P("firefox", "Firefox"), P("safari", "Safari")],
  "web-app": [P("react", "React"), P("vue", "Vue.js"), P("angular", "Angular"), P("svelte", "Svelte"), P("nextjs", "Next.js")],
  "mobile-app": [P("android", "Android"), P("ios", "iOS"), P("flutter", "Flutter")],
  "api-gateway": [P("kong", "Kong"), ...PROXIES, P("aws-apigw", "Amazon API Gateway")],
  "load-balancer": [...PROXIES, P("haproxy", "HAProxy"), P("aws-alb", "AWS ALB")],
  backend: RUNTIMES,
  microservice: RUNTIMES,
  worker: [P("celery", "Celery"), P("bullmq", "BullMQ", void 0, "#E8453C"), P("nodejs", "Node.js"), P("python", "Python"), P("go", "Go"), P("sidekiq", "Sidekiq")],
  database: [...SQL, ...NOSQL],
  "sql-database": SQL,
  "nosql-database": NOSQL,
  redis: [
    P("redis", "Redis", "Cache e estruturas em memória"),
    P("valkey", "Valkey", "Fork aberto do Redis"),
    P("memcached", "Memcached", "Cache simples chave-valor"),
    P("upstash", "Upstash", "Redis serverless")
  ],
  kafka: [
    P("kafka", "Apache Kafka", "Log distribuído particionado"),
    P("redpanda", "Redpanda", "API compatível com Kafka", "#E2401B"),
    P("pulsar", "Apache Pulsar"),
    P("nats", "NATS.io")
  ],
  queue: [P("rabbitmq", "RabbitMQ"), P("sqs", "Amazon SQS"), P("nats", "NATS.io"), P("pubsub", "Google Pub/Sub"), P("activemq", "Apache ActiveMQ"), P("azure-sb", "Azure Service Bus", void 0, "#0078D4")],
  cdn: [P("cloudflare", "Cloudflare"), P("fastly", "Fastly"), P("akamai", "Akamai"), P("cloudfront", "Amazon CloudFront"), P("bunny", "bunny.net")],
  "object-storage": [P("s3", "Amazon S3"), P("gcs", "Google Cloud Storage"), P("minio", "MinIO"), P("backblaze", "Backblaze"), P("wasabi", "Wasabi")],
  "search-engine": [
    P("elasticsearch", "Elasticsearch"),
    P("opensearch", "OpenSearch"),
    P("meilisearch", "Meilisearch"),
    P("solr", "Apache Solr"),
    P("typesense", "Typesense")
  ],
  websocket: [P("socketio", "Socket.io"), P("pusher", "Pusher"), P("ably", "Ably", void 0, "#FF5416")],
  dns: [P("cloudflare", "Cloudflare"), P("route53", "Amazon Route 53"), P("gcloud-dns", "Google Cloud")],
  "authentication-service": [P("auth0", "Auth0"), P("keycloak", "Keycloak"), P("okta", "Okta"), P("supabase", "Supabase"), P("firebase", "Firebase"), P("clerk", "Clerk")],
  "iot-device": [
    P("esp32", "ESP32", "Microcontrolador com Wi-Fi e Bluetooth"),
    P("raspberrypi", "Raspberry Pi"),
    P("arduino", "Arduino"),
    P("stm32", "STM32"),
    P("nordic", "Nordic nRF", "BLE e baixo consumo")
  ],
  "external-system": [P("salesforce", "Salesforce"), P("sap", "SAP"), P("oracle", "Oracle"), P("hubspot", "HubSpot")],
  "iot-gateway": [
    P("nodered", "Node-RED"),
    P("greengrass", "AWS IoT Greengrass", void 0, "#FF9900"),
    P("azure-iot-edge", "Azure IoT Edge", void 0, "#0078D4"),
    P("kura", "Eclipse Kura"),
    P("balena", "balena")
  ],
  "mqtt-broker": [P("mosquitto", "Eclipse Mosquitto"), P("emqx", "EMQX", void 0, "#00B173"), P("hivemq", "HiveMQ"), P("vernemq", "VerneMQ"), P("rabbitmq", "RabbitMQ (MQTT)")],
  "iot-platform": [
    P("aws-iot", "AWS IoT Core", void 0, "#FF9900"),
    P("azure-iot", "Azure IoT Hub", void 0, "#0078D4"),
    P("thingsboard", "ThingsBoard"),
    P("balena", "balena"),
    P("particle", "Particle")
  ],
  "edge-compute": [
    P("greengrass", "AWS IoT Greengrass", void 0, "#FF9900"),
    P("azure-iot-edge", "Azure IoT Edge", void 0, "#0078D4"),
    P("k3s", "K3s"),
    P("cf-workers", "Cloudflare Workers"),
    P("nodered", "Node-RED")
  ],
  waf: [P("cloudflare", "Cloudflare WAF"), P("aws-waf", "AWS WAF"), P("modsecurity", "ModSecurity"), P("imperva", "Imperva"), P("f5", "F5"), P("akamai", "Akamai")],
  "service-mesh": [P("istio", "Istio"), P("linkerd", "Linkerd"), P("consul", "Consul Connect"), P("envoy", "Envoy Proxy")],
  "rate-limiter": [P("redis", "Redis (token bucket)"), P("envoy", "Envoy Proxy"), P("kong", "Kong"), P("nginx", "NGINX"), P("cloudflare", "Cloudflare")],
  container: [P("docker", "Docker"), P("podman", "Podman"), P("containerd", "containerd")],
  kubernetes: K8S,
  serverless: [
    P("lambda", "AWS Lambda", void 0, "#FF9900"),
    P("gcloud-functions", "Google Cloud Functions"),
    P("azure-functions", "Azure Functions", void 0, "#0078D4"),
    P("cf-workers", "Cloudflare Workers"),
    P("vercel", "Vercel"),
    P("netlify", "Netlify")
  ],
  vm: [P("ec2", "Amazon EC2"), P("gce", "Google Compute Engine"), P("azure-vm", "Azure Virtual Machines"), P("vmware", "VMware"), P("proxmox", "Proxmox"), P("digitalocean", "DigitalOcean")],
  scheduler: [P("cron", "cron", "Agendador do Unix", "#64748b"), P("airflow", "Apache Airflow"), P("quartz", "Quartz"), P("kubernetes", "Kubernetes CronJob"), P("eventbridge", "EventBridge Scheduler")],
  "workflow-engine": [P("temporal", "Temporal"), P("airflow", "Apache Airflow"), P("step-functions", "AWS Step Functions"), P("camunda", "Camunda"), P("argo", "Argo Workflows"), P("prefect", "Prefect")],
  "stream-processor": [P("flink", "Apache Flink"), P("spark", "Spark Streaming"), P("kafka-streams", "Kafka Streams"), P("kinesis", "Amazon Kinesis"), P("beam", "Apache Beam")],
  "batch-processor": [P("spark", "Apache Spark"), P("hadoop", "Hadoop MapReduce"), P("dbt", "dbt"), P("beam", "Apache Beam"), P("databricks", "Databricks")],
  "ml-service": [
    P("tensorflow", "TensorFlow Serving"),
    P("pytorch", "PyTorch / TorchServe"),
    P("triton", "NVIDIA Triton"),
    P("sagemaker", "Amazon SageMaker", void 0, "#FF9900"),
    P("vertex", "Vertex AI"),
    P("openai", "OpenAI API"),
    P("huggingface", "Hugging Face"),
    P("mlflow", "MLflow")
  ],
  "timeseries-db": [P("influxdb", "InfluxDB"), P("timescaledb", "TimescaleDB"), P("prometheus", "Prometheus"), P("questdb", "QuestDB"), P("victoriametrics", "VictoriaMetrics"), P("clickhouse", "ClickHouse")],
  "graph-db": [P("neo4j", "Neo4j"), P("neptune", "Amazon Neptune"), P("arangodb", "ArangoDB"), P("janusgraph", "JanusGraph"), P("tigergraph", "TigerGraph"), P("dgraph", "Dgraph")],
  "vector-db": VECTOR,
  "data-warehouse": [
    P("snowflake", "Snowflake"),
    P("bigquery", "Google BigQuery"),
    P("redshift", "Amazon Redshift"),
    P("databricks", "Databricks"),
    P("clickhouse", "ClickHouse"),
    P("synapse", "Azure Synapse", void 0, "#0078D4")
  ],
  "event-bus": [P("eventbridge", "Amazon EventBridge"), P("azure-event-grid", "Azure Event Grid", void 0, "#0078D4"), P("eventarc", "Google Eventarc"), P("kafka", "Apache Kafka"), P("solace", "Solace")],
  "secrets-manager": [P("vault", "HashiCorp Vault"), P("aws-secrets", "AWS Secrets Manager"), P("azure-keyvault", "Azure Key Vault", void 0, "#0078D4"), P("doppler", "Doppler"), P("1password", "1Password")],
  "service-discovery": [P("consul", "HashiCorp Consul"), P("etcd", "etcd"), P("zookeeper", "Apache ZooKeeper"), P("eureka", "Netflix Eureka"), P("coredns", "CoreDNS")],
  observability: [
    P("prometheus", "Prometheus"),
    P("grafana", "Grafana"),
    P("datadog", "Datadog"),
    P("newrelic", "New Relic"),
    P("opentelemetry", "OpenTelemetry"),
    P("sentry", "Sentry"),
    P("splunk", "Splunk"),
    P("jaeger", "Jaeger"),
    P("elasticsearch", "Elastic (ELK)")
  ],
  "payment-gateway": [P("stripe", "Stripe"), P("paypal", "PayPal"), P("adyen", "Adyen"), P("mercadopago", "Mercado Pago"), P("braintree", "Braintree")],
  "third-party-api": [P("github", "GitHub API"), P("slack", "Slack API"), P("googlemaps", "Google Maps"), P("openai", "OpenAI API"), P("twilio", "Twilio")],
  "notification-service": [
    P("firebase", "Firebase"),
    P("onesignal", "OneSignal"),
    P("twilio", "Twilio"),
    P("sendgrid", "SendGrid"),
    P("mailgun", "Mailgun"),
    P("resend", "Resend")
  ]
};
for (const [type, more] of Object.entries(MORE)) {
  const list = PROVIDERS[type] ??= [];
  for (const p of more) if (!list.some((x) => x.id === p.id)) list.push(p);
}
const FALLBACK_ICON = {
  cron: "schedule",
  quartz: "schedule",
  modsecurity: "shield",
  imperva: "shield",
  bullmq: "stacks",
  redpanda: "swap_horiz",
  ably: "bolt",
  particle: "sensors",
  janusgraph: "hub",
  tigergraph: "hub",
  solace: "cable"
};
Object.assign(FALLBACK_ICON, FALLBACK_MORE);
const ASSESSMENT_RULES = "assessment-v1";
const ASSESSMENT_MIN_SCORE = 70;
const ASSESSMENT_MAX_NODES = 80;
const COMPANY_CONFIGS = Object.fromEntries(COMPANY_CASES.map((c) => [c.id, { title: c.title, level: c.level, version: `${ASSESSMENT_RULES}:${c.id}`, session: sessionFor(c) }]));
function evaluateAssessment(caseId, raw) {
  const config = Object.hasOwn(COMPANY_CONFIGS, caseId) ? COMPANY_CONFIGS[caseId] : void 0;
  if (!config) throw new Error("Somente casos de empresas podem ser avaliados.");
  const s = raw;
  if (!s || !Array.isArray(s.n) || !Array.isArray(s.e) || !s.n.length || s.n.length > ASSESSMENT_MAX_NODES || s.e.length > 240) throw new Error("Desenho inválido ou acima dos limites da avaliação.");
  const ids = /* @__PURE__ */ new Set();
  const n = s.n.map((v) => {
    if (!v || typeof v.id !== "string" || !/^[a-zA-Z0-9_.:-]{1,80}$/.test(v.id) || ids.has(v.id) || !v.d || typeof v.d.type !== "string" || !Object.hasOwn(DEFAULT_PROFILE_BY_TYPE, v.d.type) && v.d.type !== "database") throw new Error("Componente inválido.");
    ids.add(v.id);
    if (!Number.isInteger(v.d.replicas) || v.d.replicas < 1 || v.d.replicas > 100 || !Number.isFinite(v.x) || !Number.isFinite(v.y)) throw new Error("Propriedades de componente inválidas.");
    if (v.d.hitRate != null && (!Number.isFinite(v.d.hitRate) || v.d.hitRate < 0 || v.d.hitRate > 1)) throw new Error("Taxa de cache inválida.");
    if (v.d.providerId && !PROVIDERS[v.d.type]?.some((p) => p.id === v.d.providerId)) throw new Error("Provedor inválido.");
    return { id: v.id, x: v.x, y: v.y, w: Math.min(520, Math.max(176, Number(v.w) || 240)), d: { name: String(v.d.name || v.d.type).slice(0, 80), type: v.d.type, replicas: v.d.replicas, providerId: v.d.providerId, hitRate: v.d.hitRate, note: typeof v.d.note === "string" ? v.d.note.slice(0, 4e3) : void 0 } };
  });
  const edges2 = /* @__PURE__ */ new Set();
  const e = s.e.map((v) => {
    if (!v || typeof v.id !== "string" || edges2.has(v.id) || !ids.has(v.source) || !ids.has(v.target) || v.source === v.target) throw new Error("Conexão inválida.");
    edges2.add(v.id);
    const option = connectionOptions(n.find((x) => x.id === v.source).d.type, n.find((x) => x.id === v.target).d.type).find((o) => o.protocol === v.configuration?.protocol && o.mode === v.configuration?.mode);
    if (!option) throw new Error("Protocolo de conexão inválido.");
    return { id: v.id, source: v.source, target: v.target, sourcePort: ["top", "right", "bottom", "left"].includes(v.sourcePort) ? v.sourcePort : "right", targetPort: ["top", "right", "bottom", "left"].includes(v.targetPort) ? v.targetPort : "left", configuration: { mode: option.mode, protocol: option.protocol, required: true, timeoutMs: option.timeoutMs, networkLatencyMs: option.networkLatencyMs, maxAttempts: 1, backoffMs: 0, retryable: false, tls: option.tls, bidirectional: !!v.configuration.bidirectional } };
  });
  const an = n.map((v) => ({ id: v.id, type: v.d.type, name: v.d.name }));
  const hit = n.find((v) => v.d.type === "redis")?.d.hitRate ?? 0.8;
  const budget = { remaining: 4096 };
  const auto = an.filter((v) => SOURCE_TYPES.has(v.type)).flatMap((v) => buildAutoFlows(v.id, an, e, hit, budget));
  if (auto.length > 256 || auto.reduce((count, a) => count + a.flow.steps.length, 0) > 4096) throw new Error("O desenho excede o limite de caminhos da avaliação.");
  const snap = { n, e, f: auto.map((a) => a.flow), w: auto.map((a) => a.workload), m: Object.fromEntries(auto.map((a) => [a.flow.id, { name: a.name, weight: a.weight }])) };
  if (!snap.f.length) throw new Error("A avaliação precisa de fluxos ligados a uma origem de carga.");
  const doc = docOf(snap);
  const sql = new Set(PROVIDERS["sql-database"].map((p) => p.id));
  for (const v of doc.nodes) if (v.type === "database") {
    const provider = n.find((x) => x.id === v.id).d.providerId;
    v.properties.profileId = provider ? sql.has(provider) ? "sql-standard-v1" : "nosql-standard-v1" : "unresolved";
  }
  if (validateArchitecture(doc).length) throw new Error("O desenho possui conexões ou propriedades inválidas.");
  const load = config.session.load;
  const weights = weightsOf(snap.f, snap.m, load.readPct);
  const res = solveDemand(doc, { rps: load.peakRps, weights });
  let p95 = null, offered = 0, completed = 0;
  for (const flow of snap.f) {
    if (flow.steps.some((st) => st.operationClass === "write")) continue;
    const stat = res.flows.get(flow.id);
    if (!stat || stat.offered <= 0) continue;
    offered += stat.offered;
    completed += stat.completed;
    if (stat.p95Ms !== null) p95 = Math.max(p95 ?? 0, stat.p95Ms);
  }
  const checks = evaluate(config.session, { nodes: doc.nodes, flows: snap.f, loads: res.loads, p95Ms: p95, readSuccess: offered > 0 ? completed / offered : null });
  const err = errorOf(res);
  const rating = rate({ nodes: doc.nodes, edges: doc.edges, flows: snap.f, loads: res.loads, errFrac: err, p95Ms: p95, p95Target: config.session.checks?.p95Ms, lossErr: lossErrors(doc, load.peakRps, weights, err), checks, readPct: load.readPct });
  const score = rating.overall ?? 0;
  const passed = score >= ASSESSMENT_MIN_SCORE && checks.length > 0 && checks.every((c) => c.status === "meets");
  return { rulesVersion: ASSESSMENT_RULES, caseVersion: config.version, score, passed, points: passed ? score : 0, rating, checks, snap: { ...snap, g: typeof s.g === "string" ? s.g.slice(0, 4e3) : void 0, r: Array.isArray(s.r) ? s.r.slice(0, 40) : void 0 }, load };
}
export {
  ASSESSMENT_RULES,
  COMPANY_CONFIGS,
  evaluateAssessment
};

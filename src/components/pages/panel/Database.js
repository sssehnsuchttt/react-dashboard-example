import React, { useState, useEffect, useRef, useContext } from "react";
import RequestHandler from "../../../ProtectedRequest.js"
import HoverTooltip from "../../elements/Tooltip.js";
import { NotificationProvider, useNotification } from "../../elements/Notification.js";
import { AlertProvider, useAlert } from "../../elements/Alert"
import "./styles/Database.css";
import { site } from "../../../config.js";

function DatabaseButtons(props) {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <HoverTooltip title={props.title}>
      <i
        className={props.icon}
        onClick={props.onClick}
        style={{ color: isHovered ? props.color : '' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      ></i>
    </HoverTooltip>
  );
}


function Database(props) {
  const botRequest = new RequestHandler(site, props.bot);
  const [tablesList, setTablesList] = useState(null);
  const [currentTableHeader, setCurrentTableHeader] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const tableRef = useRef(null);
  const [isModified, setIsModified] = useState(false);
  const [update, setUpdate] = useState(false);
  const alert = useAlert();
  const notification = useNotification();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getTables = async () => {
    const response = await botRequest.request("get", "/tables");
    setTablesList(response.data);
    if (response.data.length > 0) {
      setCurrentTableHeader(response.data[0]);
    }
  };


  const getTable = async (table) => {
    const response = await botRequest.request("post", "/table", {
      table: table,
    });
    console.log(response)
    setCurrentTable(response.data);
  };

  const handleSwitchTable = (table) => {
    setCurrentTableHeader(table);
    setIsLoading(true);
    setSelectedCells([]);
    setSelectedRows([]);
  }

  const handleDropdownItemClick = (table) => {
    if (table != currentTableHeader) {
      if (isModified === true) {
        alert.show(
          "Подтвердите действие",
          "Все несохраненные изменения будут отменены",
          "Подтвердить",
          "Отменить",
          () => handleSwitchTable(table)
        );
      }
      else {
        handleSwitchTable(table);
      }
    }
    toggleDropdown();
  };

  const handleSelecting = () => {
    setIsSelecting(!isSelecting);
  };

  const handleCopy = async () => {
    if (selectedCells.length > 0) {
      let outputContent = "";
      let column = 0;
      let row = 0;
      let i = 0;

      for (var cell of selectedCells) {

        const rowIndex = cell[0];
        const columnIndex = cell[1];
        const tdElement = document.querySelector(`.tableContainer table tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 2})`);
        if (i !== 0) {
          if (rowIndex > row)
            outputContent += "\n";
          else if ((columnIndex > column) && (rowIndex === row))
            outputContent += "\t";
        }

        row = rowIndex;
        column = columnIndex;

        if (tdElement) {
          const content = tdElement.innerText;
          outputContent += content;
        }
        i++;
      }

      try {
        await navigator.clipboard.writeText(outputContent);
        notification.show("Операция завершена успешно", "Данные успешно скопированы в буфер обмена. Выделено ячеек: " + selectedCells.length, "uil uil-copy", "green");
      } catch (error) {
        notification.show("Ошибка копирования", `Не удалось скопировать данные в буфер обмена. Подробности: ${error}`, "uil uil-exclamation-octagon", "red");
      }
    }
  };

  const handlePaste = async () => {
    if (selectedCells.length > 0) {
      setIsModified(true);
      let column = selectedCells[0][1];
      let row = selectedCells[0][0];
      let key = "";
      let pasteCells = [];
      let pasteContent = [];

      try {
        const text = await navigator.clipboard.readText();
        for (var symbol of text) {
          if (symbol === "\t") {
            pasteCells.push([row, column]);
            column++;
            pasteContent.push(key);
            key = "";
          } else if (symbol === "\n") {
            pasteCells.push([row, column]);
            row++;
            column = selectedCells[0][1];
            pasteContent.push(key);
            key = "";
          } else {
            key += symbol;
          }
        }

        pasteCells.push([row, column]);
        pasteContent.push(key);
        commitPaste(pasteCells, pasteContent);


        notification.show("Операция завершена успешно", "Данные успешно вставлены из буфера обмена. Вставлено ячеек: " + pasteCells.length, "uil uil-clipboard-notes", "green");


      } catch (error) {
        notification.show("Ошибка чтения", `Не удалось прочитать данные из буфера обмена. Подробности: ${error}`, "uil uil-exclamation-octagon", "red");
      }
    }
  };

  const commitPaste = (pasteCells, pasteContent) => {
    if (pasteCells.length === 1) {
      for (var cell of selectedCells) {
        const tdElement = document.querySelector(`.tableContainer table tbody tr:nth-child(${cell[0] + 1}) td:nth-child(${cell[1] + 2})`);
        if (tdElement) {
          tdElement.innerText = pasteContent[0];

        }
      }
    }
    else if (selectedCells.length >= pasteCells.length) {
      let k = 0;
      for (var cell of selectedCells) {
        if ((cell[0] == pasteCells[k][0]) && (cell[1] == pasteCells[k][1])) {
          const tdElement = document.querySelector(`.tableContainer table tbody tr:nth-child(${cell[0] + 1}) td:nth-child(${cell[1] + 2})`);
          if (tdElement) {
            tdElement.innerText = pasteContent[k];

          }
          k++;
          if (k + 1 > pasteCells.length)
            break;
        }
      }
    }
    else if (selectedCells.length < pasteCells.length) {
      let k = 0;
      let i = 0;
      for (var cell of pasteCells) {

        if ((cell[0] == selectedCells[i][0]) && (cell[1] == selectedCells[i][1])) {
          const tdElement = document.querySelector(`.tableContainer table tbody tr:nth-child(${selectedCells[i][0] + 1}) td:nth-child(${selectedCells[i][1] + 2})`);
          if (tdElement) {
            tdElement.innerText = pasteContent[k];

          }
          i++;
        }
        k++;
        if (i + 1 > selectedCells.length)
          break;
      }
    }
  }

  const handleDelete = () => {
    if (selectedCells.length > 0) {
      setIsModified(true);
      for (var cell of selectedCells) {
        const tdElement = document.querySelector(`.tableContainer table tbody tr:nth-child(${cell[0] + 1}) td:nth-child(${cell[1] + 2})`);
        if (tdElement) {
          tdElement.innerText = "";
          notification.show("Удаление завершено", `Выделенные ${selectedCells.length} ячеек успешно удалены`, "uil uil-trash-alt", "red");
        }
      }
    }
    else if (selectedRows.length > 0) {
      setIsModified(true);
      const updatedTable = { ...currentTable };
      updatedTable.data = updatedTable.data.filter((_, index) => !selectedRows.some(row => row[0] === index));

      setCurrentTable(updatedTable);
      setSelectedRows([]);
      notification.show("Удаление завершено", `Выделенные ${selectedRows.length} строки успешно удалены`, "uil uil-trash-alt", "red");
    }
  };

  const handleAdd = async (table) => {
    const response = await botRequest.request("post", "/add_row", {
      table: table,
    });
    
    const updatedTable = { ...currentTable };
    updatedTable.data.push(response.data);
    setCurrentTable(updatedTable);
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current.scrollTop = tableRef.current.scrollHeight;
      }, 0);
    }
    notification.show("Новая строка добавлена", `Новая строка успешно добавлена в таблицу "${table}"`, "uil uil-plus-circle", "green");
  };

  const handleAcceptSave = async () => {
    setIsLoading(true);
    const updatedData = currentTable.data.map((row, rowIndex) => {
      return row.map((column, columnIndex) => {

        const value = document.querySelector(`.tableContainer table tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 2})`);
        return value.innerText;
      });
    });

    const newTable = { columns: currentTable.columns, data: updatedData };
    const data = { table: currentTableHeader, data: newTable };

    const response = await botRequest.request("post", "/update_table", data);
    setCurrentTableHeader(currentTableHeader);
    setIsModified(false);
    setIsLoading(false);
    notification.show("Изменения успешно сохранены", `Изменения в таблице "${currentTableHeader}" были сохранены`, "uil uil-save", "green");
  };

  const handleAcceptCancel = async () => {
    const table = currentTableHeader;
    const response = await botRequest.request("post", "/table", {
      table: table,
    });
    setCurrentTable({columns: response.data.columns, data: []});
    setUpdate(!update);
  }

  const handleSave = () => {
    if (isModified === true)
      alert.show(
        "Применить изменения",
        "Вы действительно хотите сохранить изменения?",
        "Сохранить",
        "Отменить",
        handleAcceptSave
      );
  }

  const handleCancel = () => {
    if (isModified === true)
      alert.show(
        "Подтвердите действие",
        "Все несохраненные данные будут утеряны",
        "Подтвердить",
        "Отменить",
        handleAcceptCancel
      );
    else
    {
      handleAcceptCancel();
    }
  }

  const isSelectedCell = (rowIndex, columnIndex) => {
    return selectedCells.some(([row, column]) => row === rowIndex && column === columnIndex);
  };

  const isSelectedRow = (rowIndex) => {

    return selectedRows.some(([row]) => row === rowIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getTables();
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (currentTableHeader) {
        await getTable(currentTableHeader);
        setIsModified(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentTableHeader, update]);

  const handleCellClick = (rowIndex, columnIndex) => {
    setSelectedRows([]);
    if (isSelecting && selectedCells.length === 1) {
      const range = calculateRange(selectedCells[0], [rowIndex, columnIndex]);
      setSelectedCells(range);

    } else {
      const cellExists = selectedCells.some(([r, c]) => r === rowIndex && c === columnIndex);
      if (cellExists) {
        setSelectedCells([]);
      } else {
        setSelectedCells([[rowIndex, columnIndex]]);
      }
    }
  };

  const rowCellClick = (rowIndex) => {
    setSelectedCells([]);
    if (isSelectedRow(rowIndex))
      setSelectedRows([]);
    else if (isSelecting && selectedRows.length === 1) {
      const range = [];
      const minRow = Math.min(selectedRows[0][0], rowIndex);
      const maxRow = Math.max(selectedRows[0][0], rowIndex);
      for (let row = minRow; row <= maxRow; row++) {
        range.push([row]);
      }
      setSelectedRows(range);
    }
    else
      setSelectedRows([[rowIndex]]);
  }


  const calculateRange = ([startRow, startColumn], [endRow, endColumn]) => {
    const range = [];
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minColumn = Math.min(startColumn, endColumn);
    const maxColumn = Math.max(startColumn, endColumn);

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        range.push([row, column]);
      }
    }

    return range;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Control")
        setIsSelecting(true);
      else if (event.code === "KeyC" && event.ctrlKey) {
        if (selectedCells.length > 0)
          event.preventDefault();
        handleCopy();
      }
      else if (event.code === "KeyV" && event.ctrlKey) {
        event.preventDefault();
        handlePaste();
      }
      else if (event.code === "KeyS" && event.ctrlKey) {
        event.preventDefault();
        handleSave();
      }
      else if ((event.code === "D" && event.ctrlKey) || (event.code === "Delete"))
        handleDelete();
    };

    const handleKeyUp = (event) => {
      if (event.key === "Control") {
        setIsSelecting(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCells, isModified, selectedRows]);

  return (
    <div className={props.className}>
      <div className="card" id="database">


        {tablesList && (
          <div id="databaseSettings">
            <div id="databaseDropdown">
              <div className={!showDropdown ? "databaseTables" : "databaseTables active"} onClick={toggleDropdown}>
                <div>
                  <i className="bi bi-table"></i>
                  <label>{currentTableHeader}</label>
                </div>
                <i
                  id="tableAngle"
                  className={!showDropdown ? "uil uil-angle-down" : "uil uil-angle-down active"}
                ></i>
              </div>
              <div className={!showDropdown ? "dropdownContent" : "dropdownContent active"}>
                {tablesList.map((table, index) => (
                  <div
                    key={index}
                    className="dropdownItem"
                    onClick={() => handleDropdownItemClick(table)}
                  >
                    <i className="bi bi-table"></i>
                    <label>{table}</label>
                  </div>
                ))}
              </div>
            </div>
            <div id="databaseButtons">
              <DatabaseButtons
                title="Выделить"
                icon={isSelecting ? "uil uil-check-circle" : "uil uil-circle"}
                onClick={handleSelecting}
              />
              <DatabaseButtons
                title="Копировать"
                icon="uil uil-copy"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-links')}
                onClick={handleCopy}
              />
              <DatabaseButtons
                title="Вставить"
                icon="uil uil-clipboard-notes"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-links')}
                onClick={handlePaste}
              />
              <DatabaseButtons
                title="Добавить"
                icon="uil uil-plus-circle"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-links')}
                onClick={() => handleAdd(currentTableHeader)}
              />
              <DatabaseButtons
                title="Удалить"
                icon="uil uil-trash-alt"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-text-error')}
                onClick={handleDelete}
              />
              <DatabaseButtons
                title="Сохранить"
                icon="uil uil-save"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-accept-button')}
                onClick={handleSave}
              />
              <DatabaseButtons
                title="Обновить"
                icon="uil uil-sync"
                color={getComputedStyle(document.documentElement).getPropertyValue('--color-text-error')}
                onClick={handleCancel}
              />

            </div>
          </div>
        )}

        <div ref={tableRef} className={isLoading ? "tableContainer active" : "tableContainer"}>
          {isLoading && (
            <div className="databaseLoading">
              <div id="loading_1" className="loading_circle"></div>
              <div id="loading_2" className="loading_circle"></div>
              <div id="loading_3" className="loading_circle"></div>
            </div>
          )}
          {currentTable && (
            <table>
              <thead>
                <tr>
                  <th className="thId" key={"id"}></th>
                  {currentTable.columns.map((column, index) => (
                    <th key={index}>{column.column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.data.map((row, rowIndex) => (
                  <tr key={rowIndex} data-index={rowIndex}>
                    <td
                      className={isSelectedRow(rowIndex) ? "selectedRow" : ""}
                      key={rowIndex + "id"}
                      onClick={() => rowCellClick(rowIndex)}>
                      {rowIndex + 1}
                    </td>

                    {row.map((value, columnIndex) => (
                      <td
                        key={columnIndex}
                        contentEditable={currentTable.columns[columnIndex].editable}
                        suppressContentEditableWarning
                        className={isSelectedCell(rowIndex, columnIndex) ? "selectedCell" : ""}
                        onClick={currentTable.columns[columnIndex].editable === true ? () => handleCellClick(rowIndex, columnIndex) : null}
                        onInput={() => setIsModified(true)}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export { Database };
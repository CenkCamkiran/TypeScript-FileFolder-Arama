// Data Modelleri interface olarak tanımlanmıştır.
export interface List {
  id: string;
  name: string;
  files: FilesEntity[];
}
export interface FilesEntity {
  id: string;
  name: string;
}
export interface IterationEntity {
  fileIndex: number;
  folderIndex: number;
}

// Folder ve file araması için gereken binary Search fonksiyonu.
function BinarySearch(array: number[], value: number): number {
  let start = 0;
  let end = array.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (array[mid] === value) {
      return mid;
    }

    if (value < array[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return -1;
}

// Array'i sıralamaya yarayan fonksiyon
function SortArray(List: number[]): number[] {
  let SortedArray: number[] = [];
  SortedArray = List.sort((a, b) => (a > b ? 1 : -1));

  return SortedArray;
}

// Folder id'lerini bir array'in içine atılmasını sağlayan fonksiyon
function PushFoldersToArray(list: List[]): number[] {
  const array: number[] = [];
  list.forEach((element) => {
    array.push(parseInt(element.id, 10));
  });

  return array;
}

// Files id'lerini bir array'in içine atılmasını sağlayan fonksiyon
function PushFilesToArray(fileList: FilesEntity[]): number[] {
  const array: number[] = [];
  fileList.forEach((element) => {
    array.push(parseInt(element.id, 10));
  });

  return array;
}

// Files array'i üzerinde iterate edilmesini ve üzerinde işlemler (Binary Search) yapılmasını sağlayan fonksiyon
function IterateOverFiles(list: List[], source: string): IterationEntity {
  let fileArray: number[] = [];
  let fileSearchResult: number;
  for (let i = 0; i < list.length; i += 1) {
    fileArray = PushFilesToArray(list[i].files);

    fileSearchResult = BinarySearch(fileArray, parseInt(source, 10));

    if (fileSearchResult !== -1) {
      const IterationObj: IterationEntity = {
        fileIndex: fileSearchResult,
        folderIndex: i,
      };

      return IterationObj;
    }
  }

  const IterationObj: IterationEntity = {
    fileIndex: -1,
    folderIndex: -1,
  };

  return IterationObj;
}

export default function move(list: List[], source: string, destination: string): List[] | Error {
  // var backupList: List[] = [];
  const SortedList: List[] = list.sort((a, b) =>
    parseInt(a.id, 10) > parseInt(b.id, 10) ? 1 : -1,
  );

  let FolderIDList: number[] = [];
  FolderIDList = PushFoldersToArray(SortedList);

  let SortedArray: number[] = [];
  SortedArray = SortArray(FolderIDList);

  const FolderSearchIndex: number = BinarySearch(SortedArray, parseInt(destination, 10));

  if (FolderSearchIndex === -1) {
    throw Error('You cannot specify a file as the destination');
  } else {
    const DestinationFolderID: number = parseInt(SortedList[FolderSearchIndex].id, 10);

    // destination olan folder'da, file'ı aramaya gerek yok.
    // dosya tekrardan aynı klasöre atılabilir gibi bir varsayımda bulunmadım.
    // o yüzden destination olan folder'ı listeden çıkarttım.
    const FilteredList: List[] = SortedList.filter(
      (folder) => parseInt(folder.id, 10) !== DestinationFolderID,
    );

    const IterationObject: IterationEntity = IterateOverFiles(FilteredList, source);

    if (IterationObject.fileIndex === -1) {
      throw Error('You cannot move a folder');
    } else {
      SortedList[FolderSearchIndex].files.push(
        SortedList[IterationObject.folderIndex].files[IterationObject.fileIndex],
      );
      SortedList[IterationObject.folderIndex].files.splice(IterationObject.fileIndex, 1);

      return SortedList;
    }
  }
}

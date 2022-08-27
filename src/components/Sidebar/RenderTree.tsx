import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { UIFile } from 'utils/store';
import style from './RenderTree.module.scss';
import { RenderItem } from './RenderItem';
import cn from 'classnames';
interface RenderTreeProps {
  tree: UIFile[];
  onItemClick: (item: UIFile) => void;
}
export const RenderTree: FunctionComponent<RenderTreeProps> = (props) => {
  const { tree = [] } = props;
  const [listHeight, setListHeight] = useState<number>();
  const thisList = useRef<HTMLUListElement>();
  const sortedTree = tree.sort((a, b) => {
    let sort = 0;
    if (a.type === b.type) {
      sort = a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    } else if (a.type === 'folder') {
      sort = -1;
    }
    return sort;
  });

  useEffect(() => {
    const listEl = thisList.current;
    if (listEl) {
      setTimeout(() => {
        setListHeight(listEl.scrollHeight);
      }, 500);
    }
  }, [thisList.current, tree]);
  return tree ?
    <ul className={style.sidebarList} ref={thisList} style={{ maxHeight: listHeight ? `${listHeight}px` : 'unset'}}>
      {sortedTree && sortedTree.map((file) => {
        return <li
          key={file.id}
          className={cn(
            style.fileItem,
            `fileType-${file.type}`,
            {
              [style.itemOpen]: file.isOpen,
              [style.itemClose]: !file.isOpen,
              [style.deleted]: file.deletedByUser,
            }
          )}
        >
          <RenderItem file={file} onItemClick={props.onItemClick}/>
          {file.children && file.children.length > 0 &&
            <RenderTree tree={file.children} onItemClick={props.onItemClick} />}
        </li>;
      })}
    </ul> :
    null;
};

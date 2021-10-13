const orders: { [k: string]: string[] } = {
  mark: ['link', 'em', 'strong', 'code', 'underline', 'strike'],
  node: [
    'doc',
    'paragraph',
    'blockquote',
    'horizontal_rule',
    'heading',
    'code_block',
    'ordered_list',
    'bullet_list',
    'list_item',
    'todo_list',
    'todo_item',
    'todo',
    'text',
    'image',
    'hard_break',
  ],
}

export default function orderBy(name: string) {
  return function (a: { name: string }, b: { name: string }): number {
    const order = orders[name]
    const compare = order.indexOf(a.name) - order.indexOf(b.name)

    if (compare < 0) {
      return -1
    }

    if (compare > 0) {
      return 1
    }

    return 0
  }
}

import frappe
from frappe.desk.doctype.todo.todo import ToDo

class ToDo(ToDo):
	def before_save(self):
		pass
		# super().before_save()
		# frappe.msgprint("call from override")
